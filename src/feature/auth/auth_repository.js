import User from "../../models/user.js"


export default class Auth_Repository{

    async create(user) {
        return User.create(user)
    }

    async findByEmail(email) {
        return User.findOne({
            where : {email}
        })
    }

    async findById(id) {
        return User.findByPk(id, {
            attributes: { exclude: ['password']}
        })
    }

}