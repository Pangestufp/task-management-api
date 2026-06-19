import { BadRequestError } from '../exception/app_error.js'

export const parseAIResponse = (rawText) => {
    if (!rawText || typeof rawText !== 'string') {
        throw new BadRequestError('AI returned empty or invalid response')
    }
    
    try {
        // jaga-jaga kalau masih ada markdown fence (walau pakai responseMimeType json)
        const cleaned = rawText
        .replace(/^```[a-zA-Z]*\n?/, '')
        .replace(/```$/, '')
        .trim()
        
        return JSON.parse(cleaned)
    } catch {
        throw new BadRequestError('AI returned invalid JSON format')
    }
}