import AuthRepository from './auth_repository.js'
import { hashPassword, verifyPassword } from '../../helpers/password_helper.js'
import { generateToken } from '../../helpers/jwt_helper.js'
import { BadRequestError, NotFoundError } from '../../exception/app_error.js'

export default class AuthService {
    constructor() {
        this.authRepo = new AuthRepository()
    }

    async register(data) {
        const { name, email, password, role } = data

        if (!name) {
            throw new BadRequestError('Name is required')
        }

        if (!email) {
            throw new BadRequestError('Email is required')
        }

        if (!password) {
            throw new BadRequestError('Password is required')
        }

        const lowerName = name?.trim().toLowerCase()
        const lowerEmail = email?.trim().toLowerCase()
        
        const existing = await this.authRepo.findByEmail(lowerEmail)
        if (existing){
            throw new BadRequestError('Email already in use')
        } 
        
        const hashed = await hashPassword(password)
        const user = await this.authRepo.create({ name: lowerName, email: lowerEmail, password: hashed, role })

        return this.getUser(user.id)
    }
    
    async login(data) {
        const { email, password } = data

        if (!email) {
            throw new BadRequestError('Email is required')
        }

        if (!password) {
            throw new BadRequestError('Password is required')
        }

        const lowerEmail = email?.trim().toLowerCase()

        const user = await this.authRepo.findByEmail(lowerEmail)
        
        if (!user) {
            throw new BadRequestError('Invalid email or password')
        }
        
        const isMatch = await verifyPassword(password, user.password)
        
        if (!isMatch) {
            throw new BadRequestError('Invalid email or password')
        }

        const token = generateToken(user)
        return { token }
    }
    
    async getUser(id) {
        const user = await this.authRepo.findById(id)
        if (!user) {
            throw new NotFoundError('User not found')
        }
        return user
  }
}