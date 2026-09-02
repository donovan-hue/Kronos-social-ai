const aiLimiter = require("../../middleware/aiLimiter");
const express = require("express");
const VideoGeneration = require("./VideoGeneration");
const auth = require("../../middleware/auth");
const { generateVideo } = require("./video.service");

const router = express.Router();

router.post("/generate", auth, aiLimiter, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        error: "El prompt es obligatorio"
      });
    }

    const result = await generateVideo(
      prompt.trim()
    );

    const generation =
      await VideoGeneration.create({
        user: req.user.id,
        prompt: prompt.trim(),
        status: result.status,
        videoUrl: result.videoUrl || ""
      });

    res.status(201).json({
      generation,
      development: result.development || false,
      message: result.message || null
    });
  } catch (error) {
    console.error("VIDEO_GENERATION_ERROR:", error);

    res.status(500).json({
      error: "Error generando video"
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
