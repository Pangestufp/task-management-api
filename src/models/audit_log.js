import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    request_payload: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    response_payload: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('success', 'failed'),
        allowNull: false,
    },
    failed_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
})

export default AuditLog