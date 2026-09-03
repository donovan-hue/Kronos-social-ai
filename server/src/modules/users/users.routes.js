const express = require("express");
const mongoose = require("mongoose");
const User = require("./User");
const auth = require("../../middleware/auth");
const { requireUser } = require("../../middleware/permissions");

const router = express.Router();

/**
 * GET /api/users/me
 * Obtener el usuario autenticado.
 */
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

/**
 * GET /api/users/search?q=texto
 * Buscar usuarios para la pantalla Explorar.
 */
router.get("/search", auth, async (req, res) => {
  try {
    const query =
      typeof req.query.q === "string"
        ? req.query.q.trim()
        : "";

    if (!query) {
      return res.json({
        users: []
      });
    }

    if (query.length > 50) {
      return res.status(400).json({
        error: "La búsqueda es demasiado larga"
      });
    }

    const safeQuery = query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(
      safeQuery,
      "i"
    );

    const users = await User.find({
      _id: {
        $ne: req.user.id
      },
      $or: [
        {
          username: regex
        },
        {
          displayName: regex
        }
      ]
    })
      .select(
        "_id username displayName avatar bio followers following"
      )
      .limit(30)
      .lean();

    const currentUserId =
      String(req.user.id);

    return res.json({
      users: users.map((user) => ({
        _id: user._id,
        username: user.username,
        displayName:
          user.displayName || "",
        avatar:
          user.avatar || "",
        bio:
          user.bio || "",
        followersCount:
          Array.isArray(user.followers)
            ? user.followers.length
            : 0,
        followingCount:
          Array.isArray(user.following)
            ? user.following.length
            : 0,
        isFollowing:
          Array.isArray(user.followers)
            ? user.followers.some(
                (id) =>
                  String(id) ===
                  currentUserId
              )
            : false
      }))
    });
  } catch (error) {
    console.error(
      "SEARCH_USERS_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error buscando usuarios"
    });
  }
});

/**
 * GET /api/users/:id
 * Obtener perfil público de un usuario.
 */
router.get("/:id", auth, async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        error: "ID de usuario inválido"
      });
    }

    const user = await User.findById(
      req.params.id
    )
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
    console.error(
      "GET_USER_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error obteniendo usuario"
    });
  }
});

/**
 * POST /api/users/:id/follow
 * Alterna seguir / dejar de seguir.
 */
router.post(
  "/:id/follow",
  auth,
  requireUser,
  async (req, res) => {
    try {
      const targetUserId =
        req.params.id;

      const currentUserId =
        req.user.id;

      if (
        !mongoose.isValidObjectId(
          targetUserId
        )
      ) {
        return res.status(400).json({
          error: "ID de usuario inválido"
        });
      }

      if (
        String(targetUserId) ===
        String(currentUserId)
      ) {
        return res.status(400).json({
          error:
            "No puedes seguirte a ti mismo"
        });
      }

      const targetUser =
        await User.findById(
          targetUserId
        )
          .select("_id")
          .lean();

      if (!targetUser) {
        return res.status(404).json({
          error:
            "Usuario no encontrado"
        });
      }

      const currentUser =
        await User.findById(
          currentUserId
        )
          .select("following")
          .lean();

      if (!currentUser) {
        return res.status(404).json({
          error:
            "Usuario autenticado no encontrado"
        });
      }

      const isFollowing =
        Array.isArray(
          currentUser.following
        )
          ? currentUser.following.some(
              (id) =>
                String(id) ===
                String(targetUserId)
            )
          : false;

      if (isFollowing) {
        await Promise.all([
          User.updateOne(
            {
              _id: currentUserId
            },
            {
              $pull: {
                following:
                  targetUserId
              }
            }
          ),

          User.updateOne(
            {
              _id: targetUserId
            },
            {
              $pull: {
                followers:
                  currentUserId
              }
            }
          )
        ]);
      } else {
        await Promise.all([
          User.updateOne(
            {
              _id: currentUserId
            },
            {
              $addToSet: {
                following:
                  targetUserId
              }
            }
          ),

          User.updateOne(
            {
              _id: targetUserId
            },
            {
              $addToSet: {
                followers:
                  currentUserId
              }
            }
          )
        ]);
      }

      return res.json({
        userId: targetUserId,
        following:
          !isFollowing
      });
    } catch (error) {
      console.error(
        "FOLLOW_USER_ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Error actualizando seguimiento"
      });
    }
  }
);

/**
 * PATCH /api/users/me
 * Actualizar perfil propio.
 */
router.patch(
  "/me",
  auth,
  requireUser,
  async (req, res) => {
    try {
      const allowedFields = [
        "displayName",
        "bio",
        "avatar"
      ];

      const updates = {};

      for (
        const field of allowedFields
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            field
          )
        ) {
          updates[field] =
            typeof req.body[field] ===
            "string"
              ? req.body[field].trim()
              : req.body[field];
        }
      }

      if (
        typeof updates.displayName ===
          "string" &&
        updates.displayName.length > 100
      ) {
        return res.status(400).json({
          error:
            "El nombre visible no puede superar 100 caracteres"
        });
      }

      if (
        typeof updates.bio ===
          "string" &&
        updates.bio.length > 500
      ) {
        return res.status(400).json({
          error:
            "La biografía no puede superar 500 caracteres"
        });
      }

      if (
        typeof updates.avatar ===
          "string" &&
        updates.avatar.length > 2000
      ) {
        return res.status(400).json({
          error: "Avatar inválido"
        });
      }

      const user =
        await User.findByIdAndUpdate(
          req.user.id,
          {
            $set: updates
          },
          {
            new: true,
            runValidators: true
          }
        )
          .select(
            "-passwordHash -password"
          )
          .lean();

      if (!user) {
        return res.status(404).json({
          error:
            "Usuario no encontrado"
        });
      }

      return res.json(user);
    } catch (error) {
      console.error(
        "UPDATE_PROFILE_ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Error actualizando perfil"
      });
    }
  }
);

module.exports = router;

