const multer = require("multer");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

function hasValidImageSignature(file) {
  if (!file?.buffer || !allowedMimeTypes.has(file.mimetype)) {
    return false;
  }

  const buffer = file.buffer;

  if (
    file.mimetype === "image/jpeg"
  ) {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (
    file.mimetype === "image/png"
  ) {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47,
          0x0d, 0x0a, 0x1a, 0x0a
        ])
      )
    );
  }

  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

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

function handleUpload(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(
      req,
      res,
      (error) => {
        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
              error:
                "El archivo no puede superar 10 MB"
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

        if (!hasValidImageSignature(req.file)) {
          return res.status(400).json({
            error:
              "El contenido del archivo no coincide con su formato"
          });
        }

        next();
      }
    );
  };
}

module.exports = {
  handleUpload,
  hasValidImageSignature
};
