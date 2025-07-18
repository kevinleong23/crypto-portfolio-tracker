const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePictureUrl: {
    type: String
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  twoFactorTempSecret: {
    type: String
  },
  integrations: [{
    type: {
      type: String,
      enum: ['exchange', 'wallet'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    displayName: {
      type: String // Custom user-defined name
    },
    apiKey: {
      type: String // Encrypted
    },
    apiSecret: {
      type: String // Encrypted
    },
    walletAddress: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastSync: {
    type: Date
  },
  resetPasswordOtp: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  deleteAccountOtp: {
    type: String,
  },
  deleteAccountExpires: {
      type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Pre-remove hook to delete associated data
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Delete associated portfolio
    await this.model('Portfolio').deleteOne({ userId: this._id });
    // Delete associated transactions
    await this.model('Transaction').deleteMany({ userId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema)