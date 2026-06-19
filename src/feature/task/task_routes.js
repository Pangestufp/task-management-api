import { Router } from 'express'
import TaskController from './task_controller.js'
import { authenticate } from '../../middleware/auth_middleware.js'

const router = Router()
const taskController = new TaskController()

router.get(
    '/projects/:id/tasks',
    authenticate,
    taskController.getByProject
)

export default router