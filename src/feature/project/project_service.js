import { BadRequestError, NotFoundError } from '../../exception/app_error.js'
import ProjectRepository from './project_repository.js'


export default class ProjectService {

    constructor() {
        this.projectRepo = new ProjectRepository()
    }

    async create(data, userId) {

        const { name, description } = data

        if (!name) {
            throw new BadRequestError('Name is required')
        }

        const project = await this.projectRepo.create({
            name,
            description,
            created_by: userId
        })

        return this.getById(project.id)
    }

    async getAll() {
        return this.projectRepo.findAll()
    }

    async getById(id) {

        const project = await this.projectRepo.findById(id)

        if (!project) {
            throw new NotFoundError('Project not found')
        }

        return project
    }

    async update(id, data, userId) {

        const project = await this.projectRepo.findById(id)

        if (!project) {
            throw new NotFoundError('Project not found')
        }

        const updated = await this.projectRepo.update(
            project,
            data
        )

        return updated
    }

    async delete(id, userId) {

        const project = await this.projectRepo.findById(id)

        if (!project) {
            throw new NotFoundError('Project not found')
        }

        await this.projectRepo.delete(project)

        return true
    }
}