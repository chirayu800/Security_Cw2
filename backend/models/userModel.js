import mongoose from "mongoose";
import crypto from "crypto";
import { encrypt, decrypt } from "../utils/encryption.js";

// user model 

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailHash: {
      type: String,
      required: false,
      index: true, // Index for faster searching
      sparse: true, // Allow multiple null values
    },
    password: {
      type: String,
      required: true,
    },
    passwordHistory: {
      type: [
        {
          hash: { type: String, required: true },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    passwordExpiresAt: {
      type: Date,
      default: null,
    },
    cartData: {
      type: Object,
      default: {},
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    // Secure session controls
    tokenVersion: {
      type: Number,
      default: 0,
    },
    sessionIdHash: {
      type: String,
      default: null,
    },
  },
  { minimize: false }
);


// Encrypt sensitive fields before saving
userSchema.pre('save', function (next) {
  try {
    // Only encrypt if data is modified and not already encrypted
    if (this.isModified('email') && this.email && !this.email.includes(':')) {
      // Normalize email before encryption (ensure consistency)
      const normalizedEmail = this.email.toLowerCase().trim();
      console.log("Pre-save: Encrypting email:", normalizedEmail);
      
      // Create a hash of the email for searching (deterministic)
      // This hash will be visible in MongoDB Compass for reference
      this.emailHash = crypto.createHash('sha256').update(normalizedEmail).digest('hex');
      
      // Encrypt the email for secure storage
      const encrypted = encrypt(normalizedEmail);
      this.email = encrypted;
      
      console.log("Pre-save: Email encrypted:", encrypted ? encrypted.substring(0, 30) + "..." : "FAILED");
      console.log("Pre-save: Email hash created (visible in MongoDB Compass):", this.emailHash);
      console.log("📊 Data will be saved to MongoDB with:");
      console.log("   ✅ emailHash: " + this.emailHash + " (visible in Compass)");
      console.log("   🔒 email: " + (encrypted ? encrypted.substring(0, 30) + "..." : "FAILED") + " (encrypted)");
    }
    if (this.isModified('name') && this.name && !this.name.includes(':')) {
      this.name = encrypt(this.name);
    }
    next();
  } catch (error) {
    console.error('Error in pre-save encryption hook:', error);
    console.error('This might cause login issues!');
    // In production, fail closed (never store sensitive fields in plain text)
    if (process.env.NODE_ENV === 'production') {
      next(error);
      return;
    }
    // Dev/backward compatibility fallback
    next();
  }
});

// Decrypt sensitive fields after finding documents
userSchema.post(['find', 'findOne', 'findOneAndUpdate', 'findById'], function (docs) {
  if (!docs) return;

  const decryptFields = (doc) => {
    if (!doc) return;
    // Check if encrypted (contains colons from encryption format)
    if (doc.email && typeof doc.email === 'string' && doc.email.includes(':')) {
      try {
        doc.email = decrypt(doc.email);
      } catch (e) {
        console.error('Email decryption error:', e);
      }
    }
    if (doc.name && typeof doc.name === 'string' && doc.name.includes(':')) {
      try {
        doc.name = decrypt(doc.name);
      } catch (e) {
        console.error('Name decryption error:', e);
      }
    }
  };

  if (Array.isArray(docs)) {
    docs.forEach(decryptFields);
  } else {
    decryptFields(docs);
  }
});

// Helper method to search by encrypted email
userSchema.statics.findByEmail = async function (email) {
  if (!email) return null;
  
  try {
    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Create hash of email for searching (deterministic)
    const emailHash = crypto.createHash('sha256').update(normalizedEmail).digest('hex');
    
    console.log("findByEmail: Searching for email:", normalizedEmail);
    console.log("findByEmail: Email hash:", emailHash);
    
    // Try multiple approaches to find user
    let user = null;
    
    // Approach 1: Search by emailHash (most reliable - deterministic)
    if (emailHash) {
      user = await this.findOne({ emailHash: emailHash });
      if (user) {
        console.log("✅ User found with emailHash!");
      }
    }
    
    // Approach 2: Try with encrypted email (for backward compatibility)
    if (!user) {
      try {
        const encryptedEmail = encrypt(normalizedEmail);
        console.log("findByEmail: Trying encrypted email search...");
        user = await this.findOne({ email: encryptedEmail });
        if (user) {
          console.log("✅ User found with encrypted email!");
        }
      } catch (encryptError) {
        console.warn('Encryption failed in findByEmail:', encryptError.message);
      }
    }
    
    // Approach 3: If not found, try plain email (for backward compatibility with old data)
    if (!user) {
      user = await this.findOne({ email: normalizedEmail });
      if (user) {
        console.log("✅ User found with plain email (backward compatibility)!");
      }
    }

    // If still not found, return null
    if (!user) {
      console.log("❌ User not found with any method");
      return null;
    }

    // Decrypt if found and if encrypted (check for encryption format)
    // Only decrypt if it looks encrypted (contains colons from encryption format)
    if (user.email && typeof user.email === 'string' && user.email.includes(':')) {
      try {
        user.email = decrypt(user.email);
        console.log("✅ Email decrypted successfully");
      } catch (e) {
        console.error('Email decryption error in findByEmail:', e);
        // If decryption fails, keep original (might be plain text)
      }
    }
    if (user.name && typeof user.name === 'string' && user.name.includes(':')) {
      try {
        user.name = decrypt(user.name);
      } catch (e) {
        console.error('Name decryption error in findByEmail:', e);
        // If decryption fails, keep original (might be plain text)
      }
    }

    return user;
  } catch (error) {
    console.error('Error in findByEmail:', error);
    // Final fallback: try plain email search
    try {
      return await this.findOne({ email: email.toLowerCase().trim() });
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      return null;
    }
  }
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;


