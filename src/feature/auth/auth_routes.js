import { Router } from 'express'
import AuthController from './auth_controller.js'
import { authenticate } from '../../middleware/auth_middleware.js'

const router = Router()
const authController = new AuthController()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', authenticate, authController.getMe)

export default router