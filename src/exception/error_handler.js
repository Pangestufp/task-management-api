import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
  ForbiddenError,
} from './app_error.js'

export const errorHandler = (err, req, res, next) => {
    let statusCode = 500
    let message = 'Internal Server Error'

    if (err instanceof NotFoundError ||
        err instanceof BadRequestError ||
        err instanceof InternalServerError ||
        err instanceof UnauthorizedError ||
        err instanceof ForbiddenError) 
    {
        statusCode = err.statusCode
        message = err.message
    }
    
    return res.status(statusCode).json({ message })
}