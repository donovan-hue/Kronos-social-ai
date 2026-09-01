const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token requerido"
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET no configurado");
    return res.status(500).json({
      error: "Configuración de seguridad incompleta"
    });
  }

  try {
    const token = header.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        error: "Token inválido"
      });
    }

    const decoded = jwt.verify(token, secret, {
  algorithms: ["HS256"]
});
    if (
  typeof decoded.id !== "string" ||
  !decoded.id.trim()
) {
  return res.status(401).json({
    error: "Token inválido"
  });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      error: "Token inválido o expirado"
    });
  }
};
