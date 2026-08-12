const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../users/User");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username
    },
    process.env.JWT_SECRET || "development-secret",
    {
      expiresIn: "7d"
    }
  );
}

router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      displayName
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error:
          "username, email y password son obligatorios"
      });
    }

    const normalizedUsername =
      username.trim().toLowerCase();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        error:
          "El usuario debe tener mínimo 3 caracteres"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error:
          "La contraseña debe tener mínimo 6 caracteres"
      });
    }

    const exists = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail }
      ]
    });

    if (exists) {
      return res.status(409).json({
        error:
          "El usuario o email ya existe"
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      displayName:
        displayName?.trim() ||
        normalizedUsername
    });

    const token = createToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(
      "REGISTER_ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        error:
          "El usuario o email ya existe"
      });
    }

    return res.status(500).json({
      error: "Error creando usuario"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error:
          "email y password son obligatorios"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        error: "Credenciales inválidas"
      });
    }

    let valid = false;

    // Usuarios nuevos: contraseña almacenada como hash.
    if (
      typeof user.passwordHash === "string" &&
      user.passwordHash.length > 0
    ) {
      valid = await bcrypt.compare(
        password,
        user.passwordHash
      );
    } else {
      // Migración de usuarios legacy:
      // algunos registros antiguos tienen "password"
      // en lugar de "passwordHash".
      const legacyUser =
        await User.collection.findOne({
          _id: user._id
        });

      if (
        legacyUser &&
        typeof legacyUser.password === "string" &&
        legacyUser.password.length > 0
      ) {
        // El campo legacy "password" contiene
        // un hash bcrypt ($2a$10$...), no texto plano.
        valid = await bcrypt.compare(
          password,
          legacyUser.password
        );

        if (valid) {
          await User.collection.updateOne(
            { _id: user._id },
            {
              $set: {
                passwordHash: legacyUser.password
              },
              $unset: {
                password: ""
              }
            }
          );

          user.passwordHash =
            legacyUser.password;

          console.log(
            "AUTH_MIGRATION_OK:",
            user.username
          );
        }
      }
    }

    if (!valid) {
      return res.status(401).json({
        error: "Credenciales inválidas"
      });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(
      "LOGIN_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error iniciando sesión"
    });
  }
});

module.exports = router;
