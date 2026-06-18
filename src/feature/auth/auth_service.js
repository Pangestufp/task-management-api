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
        
        const existing = await this.authRepo.findByEmail(email)
        if (existing){
            throw new BadRequestError('Email already in use')
        } 
        
        const hashed = await hashPassword(password)
        const user = await this.authRepo.create({ name, email, password: hashed, role })

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

        const user = await this.authRepo.findByEmail(email)
        
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