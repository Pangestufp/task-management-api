import ProjectService from './project_service.js'

export default class ProjectController {

    constructor() {
        this.projectService = new ProjectService()
    }

    create = async (req, res, next) => {
        try {

            const project = await this.projectService.create(
                    req.body,
                    req.user.id
                )

            return res.status(201).json({ data: project, message: 'Project created successfully'})

        } catch (error) {
            next(error)
        }
    }

    getAll = async (req, res, next) => {
        try {

            const projects = await this.projectService.getAll()

            return res.status(200).json({data: projects, message: 'Success'})

        } catch (error) {
            next(error)
        }
    }

    getById = async (req, res, next) => {
        try {

            const project = await this.projectService.getById(req.params.id)

            return res.status(200).json({data: project, message: 'Success'})

        } catch (error) {
            next(error)
        }
    }

    update = async (req, res, next) => {
        try {

            const project = await this.projectService.update(
                    req.params.id,
                    req.body,
                    req.user.id
                )

            return res.status(200).json({data: project, message: 'Project updated successfully'})

        } catch (error) {
            next(error)
        }
    }

    delete = async (req, res, next) => {
        try {

            await this.projectService.delete(
                req.params.id,
                req.user.id
            )

            return res.status(200).json({message: 'Project deleted successfully'})

        } catch (error) {
            next(error)
        }
    }
}