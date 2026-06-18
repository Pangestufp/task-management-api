import { Router } from 'express'
import authRoutes from '../feature/auth/auth_routes.js'
import projectRoutes from '../feature/project/project_routes.js'
import taskRoutes from '../feature/task/task_route.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/projects', projectRoutes)
router.use('/', taskRoutes)

export default router