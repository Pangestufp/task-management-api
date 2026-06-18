import { Router } from 'express'
import authRoutes from '../feature/auth/auth_routes.js'

const router = Router()

router.use('/auth', authRoutes)

export default router