const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null, // Nullable for failed attempts
    index: true
  },
  action: {
    type: String,
    enum: ['REGISTER', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN'],
    required: true,
    index: true
  },
  ip_address: {
    type: String,
    required: true
  },
  user_agent: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }, // Only created_at, no updated_at
  collection: 'audit_logs' // Explicitly set collection name
});

// Index for faster queries
auditLogSchema.index({ user_id: 1, action: 1 });
auditLogSchema.index({ created_at: -1 }); // For recent logs queries

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;