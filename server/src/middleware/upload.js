const multer = require("multer");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

function handleUpload(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            error: "El archivo no puede superar 10 MB"
          });
        }

        return res.status(400).json({
          error: "Error procesando el archivo"
        });
      }

      if (error) {
        return next(error);
      }

      next();
    });
  };
}

module.exports = {
  handleUpload
};
