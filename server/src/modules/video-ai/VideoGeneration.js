const mongoose = require("mongoose");

const videoGenerationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    prompt: {
      type: String,
      required: true,
      maxlength: 10000
    },
    provider: {
      type: String,
      default: "openai"
    },
    model: {
      type: String,
      default: "video-generation"
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued"
    },
    videoUrl: {
      type: String,
      default: ""
    },
    error: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "VideoGeneration",
  videoGenerationSchema
);
