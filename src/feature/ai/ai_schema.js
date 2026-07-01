export const AI_RESPONSE_SCHEMA = {
    type: 'ARRAY',
    items: {
        type: 'OBJECT',
        properties: {
            operation: {
                type: 'STRING',
                enum: ['CREATE', 'UPDATE', 'DELETE', 'REJECTED','SELECT']
            },
            table: {
                type: 'STRING'
            },
            data: {
                type: 'OBJECT',
                properties: {
                    project_id: { type: 'INTEGER', nullable: true },
                    title: { type: 'STRING', nullable: true },
                    description: { type: 'STRING', nullable: true },
                    status: {
                        type: 'STRING',
                        enum: ['todo', 'in_progress', 'done'],
                        nullable: true
                    },
                    priority: {
                        type: 'STRING',
                        enum: ['low', 'medium', 'high'],
                        nullable: true
                    },
                    assignee_id: { type: 'INTEGER', nullable: true },
                },
                required: ['project_id', 'title', 'description', 'status', 'priority', 'assignee_id'],
                nullable: true
            },
            where: {
                type: 'OBJECT',
                properties: {
                    id: { type: 'INTEGER', nullable: true }
                },
                required: ['id'],
                nullable: true
            },
            reason: { type: 'STRING', nullable: true }
        },
        required: ['operation', 'table', 'data', 'where', 'reason']
    }
}