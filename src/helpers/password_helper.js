import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

const PEPPER = process.env.PEPPER
export const hashPassword = async (password) => {
    return bcrypt.hash(password + PEPPER, 10)
}

export const verifyPassword = async (password, hashedPassword) => {
    return bcrypt.compare(password + PEPPER, hashedPassword)
}