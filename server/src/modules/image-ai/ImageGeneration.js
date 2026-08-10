const mongoose = require("mongoose");

const imageGenerationSchema = new mongoose.Schema(
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
    model: {
      type: String,
      default: "gpt-image-1"
    },
    imageUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ImageGeneration",
  imageGenerationSchema
);
