const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const clientSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  position_title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  email_address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    maxlength: 255
  },
  phone_no: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  industry: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  password_hash: {
    type: String,
    required: true
  },
  is_email_verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Automatically creates created_at and updated_at
  collection: 'clients' // Explicitly set collection name
});

// Index for faster email lookups
clientSchema.index({ email_address: 1 });
clientSchema.index({ id: 1 });

// Virtual for backward compatibility (if needed)
clientSchema.virtual('email').get(function() {
  return this.email_address;
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

