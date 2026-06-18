import User from './user.js'
import Project from './project.js'
import Task from './task.js'

User.hasMany(Project, { foreignKey: 'created_by' })
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

User.hasMany(Task, { foreignKey: 'assignee_id' })
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' })

export { User, Project }