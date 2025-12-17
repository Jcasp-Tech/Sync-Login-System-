const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * Factory function to create/get a User model for a specific client
 * Each client has its own collection: users_<clientId>
 * @param {String} clientId - The client ID (UUID)
 * @returns {mongoose.Model} User model for the specific client
 */
const getUserModel = (clientId) => {
  // Validate clientId
  if (!clientId || typeof clientId !== 'string') {
    throw new Error('Valid clientId is required to create User model');
  }

  // Collection name: users_<clientId>
  const collectionName = `users_${clientId}`;

  // Check if model already exists
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  // Define user schema
  const userSchema = new mongoose.Schema({
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      maxlength: 255
    },
    password_hash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      trim: true,
      maxlength: 255,
      default: null
    },
    custom_fields: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    client_id: {
      type: String,
      required: true,
      index: true,
      immutable: true // Cannot be changed after creation
    },
    is_email_verified: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true, // Automatically creates created_at and updated_at
    collection: collectionName // Dynamic collection name
  });

  // Compound index for email uniqueness per client (email + client_id)
  userSchema.index({ email: 1, client_id: 1 }, { unique: true });
  
  // Index for faster queries
  userSchema.index({ client_id: 1 });
  userSchema.index({ email: 1 });

  // Create and return the model
  return mongoose.model(collectionName, userSchema);
};

module.exports = getUserModel;
