import { BadRequestError } from '../exception/app_error.js'

const ALLOWED_OPERATIONS = ['CREATE', 'UPDATE', 'DELETE', 'REJECTED', 'SELECT']
const ALLOWED_TABLES = ['tasks', 'projects']
const ALLOWED_STATUS = ['todo', 'in_progress', 'done']
const ALLOWED_PRIORITY = ['low', 'medium', 'high']

const ALLOWED_TASK_FIELDS = ['project_id', 'title', 'description', 'status', 'priority', 'assignee_id']

export const validateAIResponse = (parsed) => {
    if (!Array.isArray(parsed)) {
        throw new BadRequestError('AI response must be an array')
    }

    if (parsed.length === 0) {
        throw new BadRequestError('AI returned empty operations')
    }

    for (const op of parsed) {
        if (!ALLOWED_OPERATIONS.includes(op.operation)) {
            throw new BadRequestError(`Invalid operation: ${op.operation}`)
        }

        if (op.operation === 'REJECTED') {
            throw new BadRequestError(op.reason ?? 'Request rejected by AI')
        }

        if (!ALLOWED_TABLES.includes(op.table)) {
            throw new BadRequestError(`Operation on table "${op.table}" is not allowed`)
        }

        const operationTypes = new Set(parsed.map(op => op.operation))
        
        if (operationTypes.has('SELECT') && operationTypes.size > 1) {
            throw new BadRequestError('Cannot mix SELECT with other operations in one response')
        }
        
        if (op.table=='projects') {
            if (op.operation !== 'SELECT') {
                throw new BadRequestError(op.reason ?? 'Request rejected by AI')
            }
        }

        if (op.operation === 'CREATE') {
            validateCreateData(op.data)
        }

        if (op.operation === 'SELECT') {
            if (op.table!='projects') {
                if (op.operation !== 'SELECT') {
                    throw new BadRequestError(op.reason ?? 'Request rejected by AI')
                }
            }
        }


        if (op.operation === 'UPDATE') {
            if (typeof op.where?.id !== 'number') {
                throw new BadRequestError('UPDATE must have where.id')
            }
            validateUpdateData(op.data)
        }

        if (op.operation === 'DELETE') {
            if (typeof op.where?.id !== 'number') {
                throw new BadRequestError('DELETE must have where.id')
            }
        }


    }

    return true
}

const validateCreateData = (data) => {
    if (!data) {
        throw new BadRequestError('CREATE operation must have data field')
    }

    if (typeof data.project_id !== 'number') {
        throw new BadRequestError('CREATE requires valid project_id')
    }

    if (!data.title || typeof data.title !== 'string') {
        throw new BadRequestError('CREATE requires valid title')
    }

    validateStatus(data)
    validatePriority(data)
    validateAssigneeIdRequired(data)
    validateNoForeignFields(data)
}

const validateUpdateData = (data) => {
    if (!data) {
        throw new BadRequestError('UPDATE requires data field')
    }

    // project_id tidak boleh diubah lewat UPDATE - null artinya tidak disentuh
    if (!isEmpty(data.project_id)) {
        throw new BadRequestError('project_id cannot be changed via UPDATE')
    }

    // minimal 1 field selain project_id yang isinya bukan null/undefined
    const updatableFields = ['title', 'description', 'status', 'priority', 'assignee_id']
    const hasAtLeastOneChange = updatableFields.some(key => !isEmpty(data[key]))

    if (!hasAtLeastOneChange) {
        throw new BadRequestError('UPDATE requires at least 1 field to update')
    }

    validateStatus(data)
    validatePriority(data)
    validateAssigneeIdOptional(data)
    validateNoForeignFields(data)
}

const validateStatus = (data) => {
    // null/undefined = diabaikan (gak diubah pas UPDATE, pakai default pas CREATE)
    if (!isEmpty(data.status) && !ALLOWED_STATUS.includes(data.status)) {
        throw new BadRequestError(`Invalid status: ${data.status}. Must be one of ${ALLOWED_STATUS.join(', ')}`)
    }
}

const validatePriority = (data) => {
    if (!isEmpty(data.priority) && !ALLOWED_PRIORITY.includes(data.priority)) {
        throw new BadRequestError(`Invalid priority: ${data.priority}. Must be one of ${ALLOWED_PRIORITY.join(', ')}`)
    }
}

// CREATE: assignee_id wajib ada
const validateAssigneeIdRequired = (data) => {
    if (isEmpty(data.assignee_id)) {
        throw new BadRequestError('CREATE requires valid assignee_id')
    }
    if (typeof data.assignee_id !== 'number') {
        throw new BadRequestError('assignee_id must be a number')
    }
}

// UPDATE: assignee_id optional - null artinya gak diubah
const validateAssigneeIdOptional = (data) => {
    if (!isEmpty(data.assignee_id) && typeof data.assignee_id !== 'number') {
        throw new BadRequestError('assignee_id must be a number')
    }
}

const validateNoForeignFields = (data) => {
    const invalidFields = Object.keys(data).filter(key => !ALLOWED_TASK_FIELDS.includes(key))
    if (invalidFields.length > 0) {
        throw new BadRequestError(`Unknown field(s) in data: ${invalidFields.join(', ')}`)
    }
}

const isEmpty = (value) => {
    if (value === null) {
        return true
    }

    if (value === undefined) {
        return true
    }

    return false
}