import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import User from './models/user.js'
import Project from './models/project.js'
import Task from './models/task.js'
import AuditLog from './models/audit_log.js'
import sequelize from './config/database.js'
import routes from './routes/index.js'
import { errorHandler } from './exception/error_handler.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', routes)
app.use(errorHandler)

const PORT = process.env.PORT

await sequelize.sync({ alter: true })
console.log('Database aman')

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})