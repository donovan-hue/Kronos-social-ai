const express = require("express");
const User = require("./User");
const auth = require("../../middleware/auth");
const {
  requireUser,
  requireSameUser
} = require("../../middleware/permissions");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash -password")
      .lean();

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("GET_ME_ERROR:", error);

    return res.status(500).json({
      error: "Error obteniendo usuario"
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select(
        "_id username displayName avatar bio followers following createdAt"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("GET_USER_ERROR:", error);

    return res.status(500).json({
      error: "Error obteniendo usuario"
    });
  }
});

router.patch("/me", auth, async (req, res) => {
  try {
    const allowedFields = [
      "displayName",
      "bio",
      "avatar"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(
        req.body,
        field
      )) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (
      typeof updates.displayName === "string" &&
      updates.displayName.length > 100
    ) {
      return res.status(400).json({
        error:
          "El nombre visible no puede superar 100 caracteres"
      });
    }

    if (
      typeof updates.bio === "string" &&
      updates.bio.length > 500
    ) {
      return res.status(400).json({
        error:
          "La biografía no puede superar 500 caracteres"
      });
    }

    if (
      typeof updates.avatar === "string" &&
      updates.avatar.length > 2000
    ) {
      return res.status(400).json({
        error: "Avatar inválido"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: updates
      },
      {
        new: true,
        runValidators: true
      }
    )
      .select("-passwordHash -password")
      .lean();

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    return res.json(user);
  } catch (error) {
    console.error(
      "UPDATE_PROFILE_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error actualizando perfil"
    });
  }
});

module.exports = router;
