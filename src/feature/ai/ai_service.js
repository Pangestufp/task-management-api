import sequelize from '../../config/database.js'
import { parseAIResponse } from '../../helpers/ai_parse.js'
import { validateAIResponse } from '../../helpers/ai_validator.js'
import { BadRequestError, InternalServerError } from '../../exception/app_error.js'
import AiRepository from './ai_repository.js'
import AuditRepository from '../audit/audit_repository.js'
import { SYSTEM_PROMPT } from './ai_prompt.js'
import { AI_RESPONSE_SCHEMA } from './ai_schema.js'

export default class AiService {
    constructor() {
        this.aiRepo = new AiRepository()
        this.auditRepo = new AuditRepository()
    }

    async executeCommand(data, userId) {
        const { prompt } = data

        if (!prompt) {
            throw new BadRequestError('Prompt is required')
        }

        let auditStatus = 'success'
        let auditReason = null
        let aiResponseRaw = null
        let results = null

        try {
            // 1. Call Gemini
            aiResponseRaw = await this.callGemini(prompt)

            // 2. Parse JSON aman
            const parsed = parseAIResponse(aiResponseRaw)

            // 3. Validasi
            validateAIResponse(parsed)

            // 4. Eksekusi SEMUA operation dalam SATU transaction
            results = await sequelize.transaction(async (transaction) => {
                return this.aiRepo.executeOperations(parsed, transaction)
            })
            // kalau ada 1 saja gagal di dalam executeOperations → throw →
            // sequelize.transaction() otomatis ROLLBACK semuanya

            return results

        } catch (err) {

            auditStatus = 'failed'
            auditReason = err.message

            throw err instanceof BadRequestError ? err : new BadRequestError(err.message)

        } finally {
        
            //audit log WAJIB tersimpan apapun hasilnya
            await this.auditRepo.create({
                user_id: userId,
                action: 'AI_COMMAND',
                request_payload: JSON.stringify({ prompt }),
                response_payload: aiResponseRaw,
                status: auditStatus,
                failed_reason: auditReason,
            }).catch(err => {})
        }
    }

    async callGemini(prompt) {
        const controller = new AbortController()
        
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, 20000)

        try {

            const response = await fetch(process.env.GEMINI_URL, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: SYSTEM_PROMPT }]
                    },
                    contents: [
                        { parts: [{ text: prompt }] }
                    ],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        responseSchema: AI_RESPONSE_SCHEMA,
                    }
                })
            })

            if (!response.ok) {
                const errBody = await response.text()
                throw new InternalServerError(
                    `Failed to call AI service: ${errBody}`
                )
            }

            const data = await response.json()

            return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null

        } catch (err) {

            if (err.name === 'AbortError') {
                throw new InternalServerError(
                    'AI service timeout after 20 seconds'
                )
            }

            throw err

        } finally {
            clearTimeout(timeoutId)
        }
    }
}