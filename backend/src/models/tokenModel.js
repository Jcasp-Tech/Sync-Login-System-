const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  token_type: {
    type: String,
    enum: ['Access', 'Refresh'],
    required: true
  },
  token_hash: {
    type: String,
    required: true
  },
  expires_at: {
    type: Date,
    required: true,
    index: true
  },
  revoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Automatically creates created_at and updated_at
  collection: 'tokens' // Explicitly set collection name
});

// Index for faster queries
tokenSchema.index({ user_id: 1, token_type: 1 });
tokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;