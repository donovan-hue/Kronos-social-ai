const express = require("express");
const mongoose = require("mongoose");

const Post = require("./Post");
const auth = require("../../middleware/auth");

const router = express.Router();

const MAX_POST_LENGTH = 5000;
const MAX_COMMENT_LENGTH = 1000;

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(
        "author",
        "username displayName avatar"
      )
      .populate(
        "comments.user",
        "username displayName avatar"
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ posts });
  } catch (error) {
    console.error("GET_POSTS_ERROR:", error);

    return res.status(500).json({
      error: "Error obteniendo publicaciones"
    });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const content =
      typeof req.body.content === "string"
        ? req.body.content.trim()
        : "";

    if (!content) {
      return res.status(400).json({
        error: "La publicación está vacía"
      });
    }

    if (content.length > MAX_POST_LENGTH) {
      return res.status(400).json({
        error:
          "La publicación no puede superar 5000 caracteres"
      });
    }

    const post = await Post.create({
      content,
      author: req.user.id
    });

    await post.populate(
      "author",
      "username displayName avatar"
    );

    return res.status(201).json({
      post
    });
  } catch (error) {
    console.error("CREATE_POST_ERROR:", error);

    return res.status(500).json({
      error: "Error creando publicación"
    });
  }
});

router.post("/:postId/comments", auth, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!validId(postId)) {
      return res.status(400).json({
        error: "ID de publicación inválido"
      });
    }

    const content =
      typeof req.body.content === "string"
        ? req.body.content.trim()
        : "";

    if (!content) {
      return res.status(400).json({
        error: "El comentario está vacío"
      });
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({
        error:
          "El comentario no puede superar 1000 caracteres"
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            user: req.user.id,
            content
          }
        }
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate(
        "author",
        "username displayName avatar"
      )
      .populate(
        "comments.user",
        "username displayName avatar"
      );

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada"
      });
    }

    return res.status(201).json({
      post
    });
  } catch (error) {
    console.error(
      "CREATE_COMMENT_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error creando comentario"
    });
  }
});

router.post("/:postId/like", auth, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!validId(postId)) {
      return res.status(400).json({
        error: "ID de publicación inválido"
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada"
      });
    }

    const userId = new mongoose.Types.ObjectId(
      req.user.id
    );

    const alreadyLiked = post.likes.some((id) =>
      id.equals(userId)
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => !id.equals(userId)
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.json({
      liked: !alreadyLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error("LIKE_POST_ERROR:", error);

    return res.status(500).json({
      error: "Error actualizando like"
    });
  }
});

module.exports = router;
