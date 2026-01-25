import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Encrypt email before saving
newsletterSchema.pre('save', function(next) {
  if (this.isModified('email') && this.email && !this.email.includes(':')) {
    // Normalize email before encryption
    const normalizedEmail = this.email.toLowerCase().trim();
    this.email = encrypt(normalizedEmail);
  }
  next();
});

// Decrypt email after finding documents
newsletterSchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
  if (!docs) return;
  
  const decryptFields = (doc) => {
    if (!doc) return;
    if (doc.email) doc.email = decrypt(doc.email);
  };

  if (Array.isArray(docs)) {
    docs.forEach(decryptFields);
  } else {
    decryptFields(docs);
  }
});

// Helper method to find by encrypted email
newsletterSchema.statics.findByEmail = async function(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const encryptedEmail = encrypt(normalizedEmail);
  let subscriber = await this.findOne({ email: encryptedEmail });
  
  // Backward compatibility
  if (!subscriber) {
    subscriber = await this.findOne({ email: normalizedEmail });
  }
  
  if (subscriber && subscriber.email) {
    subscriber.email = decrypt(subscriber.email);
  }
  
  return subscriber;
};

const newsletterModel = mongoose.models.newsletter || mongoose.model("newsletter", newsletterSchema);

export default newsletterModel;

