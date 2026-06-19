import { Router } from 'express'

import AiController from './ai_controller.js'
import { authenticate } from '../../middleware/auth_middleware.js'

const router = Router()

const aiController = new AiController()

router.post(
    '/ai/command',
    authenticate,
    aiController.executeCommand
)

export default router