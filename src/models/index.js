import User from './user.js'
import Project from './project.js'

User.hasMany(Project, { foreignKey: 'created_by' })
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

export { User, Project }