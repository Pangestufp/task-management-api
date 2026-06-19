import { Router } from 'express'
import authRoutes from '../feature/auth/auth_routes.js'
import projectRoutes from '../feature/project/project_routes.js'
import taskRoutes from '../feature/task/task_routes.js'
import aiRoutes from '../feature/ai/ai_routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/projects', projectRoutes)
router.use('/', taskRoutes)
router.use('/', aiRoutes)

export default router