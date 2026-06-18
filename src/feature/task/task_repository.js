import Task from "../../models/task.js";
import User from "../../models/user.js";

export default class TaskRepository {

    async findByProjectId(projectId) {
        return Task.findAll({
            where: {
                project_id: projectId
            },
            include: [{
                model: User,
                as: 'assignee',
                attributes: ['id', 'name', 'email']
            }]
        })
    }
}