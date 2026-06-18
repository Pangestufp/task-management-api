import { Project, User } from '../../models/index.js'

export default class ProjectRepository {
    
    async create(data) {
        return Project.create(data)
    }

    async findAll() {
        return Project.findAll({
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email']
            }]
        })
    }

    async findById(id) {
        return Project.findByPk(id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name', 'email']
            }]
        })
    }

    async update(project, data) {
        return project.update(data)
    }

    async delete(project) {
        return project.destroy()
    }

}