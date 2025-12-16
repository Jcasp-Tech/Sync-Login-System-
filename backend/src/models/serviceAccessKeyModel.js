const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const serviceAccessKeySchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  access_key_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  access_key_secret_hash: {
    type: String,
    required: true
  },
  client_id: {
    type: String,
    required: true,
    index: true,
    ref: 'Client'
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  rate_limit: {
    type: Number,
    default: 1000, // requests per hour
    min: 1
  },
  environment: {
    type: String,
    required: true,
    enum: ['live', 'test'],
    index: true
  },
  revoked_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Automatically creates created_at and updated_at
  collection: 'service_access_keys' // Explicitly set collection name
});

// Indexes for faster queries
serviceAccessKeySchema.index({ access_key_id: 1, is_active: 1 });
serviceAccessKeySchema.index({ client_id: 1, is_active: 1 });
serviceAccessKeySchema.index({ client_id: 1, environment: 1 }); // For filtering by client and environment
serviceAccessKeySchema.index({ revoked_at: 1 });

const ServiceAccessKey = mongoose.model('ServiceAccessKey', serviceAccessKeySchema);

module.exports = ServiceAccessKey;

