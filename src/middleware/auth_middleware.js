import { validateToken } from '../helpers/jwt_helper.js'

export const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Token required' })
    }
    
    const { id, role, error } = validateToken(token)

    if (error) {
        return res.status(401).json({ message: error })
    }
    
    req.user = { id, role }
    
    next()
}

export const authorizeRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' })
    }
    
    next()
}