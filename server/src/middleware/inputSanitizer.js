function sanitizeValue(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const sanitized = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }

      sanitized[key] = sanitizeValue(nestedValue);
    }

    return sanitized;
  }

  return value;
}

function inputSanitizer(req, res, next) {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeValue(req.body);
    }

    if (req.query && typeof req.query === "object") {
      req.query = sanitizeValue(req.query);
    }

    if (req.params && typeof req.params === "object") {
      req.params = sanitizeValue(req.params);
    }

    next();
  } catch (error) {
    error.statusCode = 400;
    error.message = "Datos de entrada inválidos.";
    next(error);
  }
}

module.exports = inputSanitizer;
