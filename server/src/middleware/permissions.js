function requireUser(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Usuario no autenticado"
    });
  }

  next();
}

function requireSameUser(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: "Usuario no autenticado"
    });
  }

  const requestedUserId =
    req.params.userId || req.params.id;

  if (!requestedUserId) {
    return res.status(400).json({
      error: "ID de usuario requerido"
    });
  }

  if (String(req.user.id) !== String(requestedUserId)) {
    return res.status(403).json({
      error: "No tienes permisos para realizar esta acción"
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireSameUser
};
