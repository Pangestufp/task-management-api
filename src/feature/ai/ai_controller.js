import AiService from './ai_service.js'

export default class AiController {

    constructor() {
        this.aiService = new AiService()
    }

    executeCommand = async (req, res, next) => {
        try {

            const result = await this.aiService.executeCommand(req.body, req.user.id)

            return res.status(200).json({data: result, message: 'AI command executed successfully'})

        } catch (error) {
            next(error)
        }
    }
}