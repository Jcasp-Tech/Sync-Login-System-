const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const emailVerificationTokenSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  client_id: {
    type: String,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  user_type: {
    type: String,
    required: true,
    enum: ['client', 'user'],
    default: 'client'
  },
  expires_at: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index to auto-delete expired tokens
  },
  verified_at: {
    type: Date,
    default: null
  },
  is_used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'email_verification_tokens'
});

// Compound index for faster lookups
emailVerificationTokenSchema.index({ user_id: 1, client_id: 1 });
emailVerificationTokenSchema.index({ token: 1, is_used: 1 });

const EmailVerificationToken = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);

module.exports = EmailVerificationToken;
