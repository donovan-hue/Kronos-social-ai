const mongoose = require("mongoose");

const scriptSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: [
        "video",
        "reel",
        "youtube",
        "advertisement",
        "story",
        "presentation",
        "custom"
      ],
      default: "custom"
    },
    provider: {
      type: String,
      default: "openrouter"
    },
    model: {
      type: String,
      default: "openrouter/free"
    },
    result: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Script", scriptSchema);
