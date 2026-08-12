const express = require("express");
const ImageGeneration = require("./ImageGeneration");
const auth = require("../../middleware/auth");
const { generateImage } = require("./image.service");

const router = express.Router();

router.post("/generate", auth, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        error: "El prompt es obligatorio"
      });
    }

    const result = await generateImage(prompt.trim());

    const generation = await ImageGeneration.create({
      user: req.user.id,
      prompt: prompt.trim(),
      model:
        result.model ||
        process.env.OPENROUTER_IMAGE_MODEL ||
        "google/gemini-2.5-flash-image",
      imageUrl: result.url || ""
    });

    res.status(201).json({
      generation,
      development: result.development || false,
      message: result.message || null
    });
  } catch (error) {
    console.error("IMAGE_GENERATION_ERROR:", error);

    res.status(500).json({
      error: "Error generando imagen"
    });
  }
});

router.get("/history", auth, async (req, res) => {
  const generations = await ImageGeneration.find({
    user: req.user.id
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    generations
  });
});

router.delete("/:id", auth, async (req, res) => {
  const generation = await ImageGeneration.findOneAndDelete({
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
