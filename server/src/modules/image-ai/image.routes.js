const express = require("express");
const auth = require("../../middleware/auth");
const aiLimiter = require("../../middleware/aiLimiter");
const { handleUpload } = require("../../middleware/upload");
const imageService = require("./image.service");

const router = express.Router();

router.post(
  "/generate",
  auth,
  async (req, res) => {
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
          error:
            "El prompt no puede superar 4000 caracteres"
        });
      }

      const result =
        await imageService.generateImage({
          prompt: prompt.trim(),
          userId: req.user.id
        });

      return res.status(200).json(result);
    } catch (error) {
      console.error(
        "IMAGE_GENERATION_ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "No se pudo generar la imagen"
      });
    }
  }
);

router.post(
  "/upload",
  auth,
  handleUpload("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "La imagen es obligatoria"
        });
      }

      const result =
        await imageService.uploadImage({
          file: req.file,
          userId: req.user.id
        });

      return res.status(201).json(result);
    } catch (error) {
      console.error(
        "IMAGE_UPLOAD_ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "No se pudo subir la imagen"
      });
    }
  }
);

module.exports = router;
