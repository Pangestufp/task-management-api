import { Router } from 'express'

import ProjectController from './project_controller.js'
import { authenticate, authorizeRole } from '../../middleware/auth_middleware.js'


const router = Router()

const projectController =
    new ProjectController()

router.get(
    '/',
    authenticate,
    projectController.getAll
)

router.get(
    '/:id',
    authenticate,
    projectController.getById
)

router.post(
    '/',
    authenticate,
    authorizeRole('admin'),
    projectController.create
)

router.put(
    '/:id',
    authenticate,
    authorizeRole('admin'),
    projectController.update
)

router.delete(
    '/:id',
    authenticate,
    authorizeRole('admin'),
    projectController.delete
)

export default router