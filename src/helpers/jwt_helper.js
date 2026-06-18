import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const SECRET = process.env.JWT_SECRET

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            role: user.role,
        },
        SECRET,
        { expiresIn: '1d' }
  )
}

export const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET)
        
        return { id: decoded.id, role: decoded.role, error: null }
        
    } catch (err) {

        if (err.name === 'TokenExpiredError') {
            return { id: null, role: null, error: 'Token expired' }
        }

        return { id: null, role: null, error: 'Invalid token' }
  }
}