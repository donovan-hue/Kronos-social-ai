const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../users/User");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
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
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email y password son obligatorios"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener mínimo 6 caracteres"
      });
    }

    const exists = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (exists) {
      return res.status(409).json({
        error: "El usuario o email ya existe"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: passwordHash,
      displayName: displayName || username
    });

    const token = createToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error creando usuario"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email?.toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: "Credenciales inválidas"
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        error: "Credenciales inválidas"
      });
    }

    const token = createToken(user);

    res.json({
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
    console.error(error);
    res.status(500).json({
      error: "Error iniciando sesión"
    });
  }
});

module.exports = router;
