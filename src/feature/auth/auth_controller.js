import AuthService from './auth_service.js'

export default class AuthController {
    constructor() {
        this.authService = new AuthService()
    }

    register = async (req, res, next) => {
        try {
            const user = await this.authService.register(req.body)
            return res.status(201).json({ data: user, message: "Register Succesful" })
        } catch (error) {
            next(error)
        }
    }

    login = async (req, res, next) => {
        try {
            const result = await this.authService.login(req.body)
            return res.status(200).json({ data: result, message: "Login Succesful"})
        } catch (error) {
            next(error)
        }
    }
    
    getMe = async (req, res, next) => {
        try {
            const user = await this.authService.getUser(req.user.id)
            return res.status(200).json({ data: user, message: "Success get own data" })
        } catch (error) {
            next(error)
        }
    }
}