const aiLimiter = require("../../middleware/aiLimiter");
const express = require("express");
const VideoGeneration = require("./VideoGeneration");
const auth = require("../../middleware/auth");
const { generateVideo } = require("./video.service");
const {
  getAIErrorResponse
} = require("../../middleware/aiError");
const {
  getAIProviderConfig
} = require("../../config/aiProviders");

const router = express.Router();

router.post("/generate", auth, aiLimiter, async (req, res) => {
  let generation;

  try {
    const { prompt } = req.body;

    if (
      typeof prompt !== "string" ||
      !prompt.trim()
    ) {
      return res.status(400).json({
        error: "El prompt es obligatorio"
      });
    }

    if (prompt.length > 4000) {
      return res.status(400).json({
        error: "El prompt no puede superar 4000 caracteres"
      });
    }

    const provider =
      getAIProviderConfig("video");

    generation = await VideoGeneration.create({
      user: req.user.id,
      prompt: prompt.trim(),
      provider: provider.provider,
      model: provider.model,
      status: "processing"
    });

    const result = await generateVideo(
      prompt.trim(),
      provider.apiKey
    );

    generation.status = result.status;
    generation.videoUrl = result.videoUrl || "";
    generation.error = "";
    await generation.save();

    res.status(201).json({
      generation,
      development: result.development || false,
      message: result.message || null
    });
  } catch (error) {
    console.error("VIDEO_GENERATION_ERROR:", error);

    if (generation) {
      generation.status = "failed";
      generation.error = error.message || "VIDEO_GENERATION_ERROR";
      await generation.save().catch((saveError) => {
        console.error("VIDEO_GENERATION_SAVE_ERROR:", saveError);
      });
    }

    const aiError = getAIErrorResponse(error);

    res.status(aiError.status).json({
      error: aiError.message,
      code: aiError.code
    });
  }
});

router.get("/history", auth, async (req, res) => {
  const generations =
    await VideoGeneration.find({
      user: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(50);

  res.json({
    generations
  });
});

router.get("/:id", auth, async (req, res) => {
  const generation =
    await VideoGeneration.findOne({
      _id: req.params.id,
      user: req.user.id
    });

  if (!generation) {
    return res.status(404).json({
      error: "Generación no encontrada"
    });
  }

  res.json({
    generation
  });
});

router.delete("/:id", auth, async (req, res) => {
  const generation =
    await VideoGeneration.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

  if (!generation) {
    return res.status(404).json({
      error: "Generación no encontrada"
    });
  }

  res.json({
    deleted: true
  });
});

module.exports = router;
