import AuditLog from '../../models/audit_log.js'

export default class AuditRepository {
    async create(data) {
        return AuditLog.create(data)
    }
}