import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
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
  { timestamps: true }
);

const adminSettingsModel = mongoose.models.adminsettings || mongoose.model("adminsettings", adminSettingsSchema);

export default adminSettingsModel;

