import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
  },
  { timestamps: true }
);

// Encrypt sensitive fields before saving
contactSchema.pre('save', function(next) {
  if (this.isModified('email') && this.email && !this.email.includes(':')) {
    this.email = encrypt(this.email);
  }
  if (this.isModified('name') && this.name && !this.name.includes(':')) {
    this.name = encrypt(this.name);
  }
  if (this.isModified('message') && this.message && !this.message.includes(':')) {
    this.message = encrypt(this.message);
  }
  next();
});

// Decrypt sensitive fields after finding documents
contactSchema.post(['find', 'findOne', 'findOneAndUpdate'], function(docs) {
  if (!docs) return;
  
  const decryptFields = (doc) => {
    if (!doc) return;
    if (doc.email) doc.email = decrypt(doc.email);
    if (doc.name) doc.name = decrypt(doc.name);
    if (doc.message) doc.message = decrypt(doc.message);
  };

  if (Array.isArray(docs)) {
    docs.forEach(decryptFields);
  } else {
    decryptFields(docs);
  }
});

const contactModel = mongoose.models.contact || mongoose.model("contact", contactSchema);

export default contactModel;

