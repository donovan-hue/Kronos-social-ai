const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Token requerido"
    });
  }

  try {
    const token = header.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-secret"
    );

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      error: "Token inválido o expirado"
    });
  }
};
