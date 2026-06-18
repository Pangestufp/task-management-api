import TaskRepository from './task_repository.js'
import ProjectRepository from '../project/project_repository.js'
import { NotFoundError } from '../../exception/app_error.js'

export default class TaskService {

    constructor() {
        this.taskRepo = new TaskRepository()
        this.projectRepo = new ProjectRepository()
    }

    async getByProject(projectId) {

        const project = await this.projectRepo.findById(projectId)

        if (!project) {
            throw new NotFoundError('Project not found')
        }

        const tasks = await this.taskRepo.findByProjectId(projectId)

        return tasks
    }
}