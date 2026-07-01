import { NotFoundError } from '../../exception/app_error.js'
import Task from '../../models/task.js'
import Project from "../../models/project.js"
import sequelize from '../../config/database.js'

export default class AiRepository {

  async executeOperations(operations, transaction) {
    const results = []

    for (const op of operations) {

        if (op.operation === 'CREATE') {
            const project = await Project.findByPk(op.data.project_id, { transaction })
            if (!project) {
                throw new NotFoundError(`Project ID ${op.data.project_id} not found`)
            }

            const task = await Task.create(op.data, { transaction })
            results.push({ operation: 'CREATE', task: task.toJSON() })
        }

        if (op.operation === 'UPDATE') {
            const task = await Task.findByPk(op.where.id, { transaction })

            if (!task) {
                throw new NotFoundError(`Task ID ${op.where.id} not found`)
            }

            // buang field null biar gak nge-reset kolom yang gak diubah
            const cleanData = Object.fromEntries(
                Object.entries(op.data).filter(([_, value]) => value !== null)
            )

            await task.update(cleanData, { transaction })
            results.push({ operation: 'UPDATE', task: task.toJSON() })
        }

        if (op.operation === 'DELETE') {
            const task = await Task.findByPk(op.where.id, { transaction })

            if (!task) {
                throw new NotFoundError(`Task ID ${op.where.id} not found`)
            }

            await task.destroy({ transaction })
            results.push({ operation: 'DELETE', id: op.where.id })
        }

    }

    return results
  }

    async executeSelectOperations(operations) {
        const op = operations[0]
            if (op.where?.id) {
                return Project.findAll({
                    distinct: true,
                    include: [{
                        model: Task,
                        as: 'tasks',
                        where: { assignee_id: op.where.id },
                        attributes: []
                    }]
                });
            } else {
                return sequelize.query(
                    "select distinct p.* from projects p join tasks t on p.id = t.project_id where t.status = 'in_progress' and t.priority = 'high'",
                    { type: sequelize.QueryTypes.SELECT }
                )
            }
        
    }
}
