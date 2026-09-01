const express = require("express");
const multer = require("multer");
const auth = require("../../middleware/auth");
const imageService = require("./image.service");

const router = express.Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new Error("UNSUPPORTED_IMAGE_TYPE")
      );
    }

    callback(null, true);
  }
});

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
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            error:
              "La imagen no puede superar 10 MB"
          });
        }

        return res.status(400).json({
          error:
            "Error procesando el archivo"
        });
      }

      if (error) {
        if (
          error.message ===
          "UNSUPPORTED_IMAGE_TYPE"
        ) {
          return res.status(400).json({
            error:
              "Formato de imagen no permitido. Usa JPG, PNG o WebP."
          });
        }

        return next(error);
      }

      next();
    });
  },
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
