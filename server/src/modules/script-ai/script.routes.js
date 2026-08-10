const express = require("express");
const Script = require("./Script");
const auth = require("../../middleware/auth");
const { generateScript } = require("./script.service");

const router = express.Router();

router.post("/generate", auth, async (req, res) => {
  try {
    const { prompt, type = "custom" } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        error: "El prompt es obligatorio"
      });
    }

    const result = await generateScript({
      prompt: prompt.trim(),
      type
    });

    const script = await Script.create({
      user: req.user.id,
      prompt: prompt.trim(),
      type,
      result
    });

    res.status(201).json({
      script
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error generando script"
    });
  }
});

router.get("/history", auth, async (req, res) => {
  const scripts = await Script.find({
    user: req.user.id
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    scripts
  });
});

router.get("/:id", auth, async (req, res) => {
  const script = await Script.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!script) {
    return res.status(404).json({
      error: "Script no encontrado"
    });
  }

  res.json({
    script
  });
});

router.delete("/:id", auth, async (req, res) => {
  const script = await Script.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!script) {
    return res.status(404).json({
      error: "Script no encontrado"
    });
  }

  res.json({
    deleted: true
  });
});

module.exports = router;
