import TaskService from './task_service.js'

export default class TaskController {

    constructor() {
        this.taskService = new TaskService()
    }

    getByProject = async (req, res, next) => {
        try {

            const result = await this.taskService.getByProject(
                req.params.id
            )

            return res.status(200).json({data: result, message: 'Success'})

        } catch (error) {
            next(error)
        }
    }
}