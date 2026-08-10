const express = require("express");
const Post = require("./Post");
const auth = require("../../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { text = "", media = [] } = req.body;

    if (!text.trim() && !media.length) {
      return res.status(400).json({
        error: "La publicación necesita texto o multimedia"
      });
    }

    const post = await Post.create({
      author: req.user.id,
      text: text.trim(),
      media
    });

    const result = await post.populate(
      "author",
      "username displayName avatar"
    );

    res.status(201).json({
      post: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error creando publicación"
    });
  }
});

router.get("/feed", auth, async (req, res) => {
  try {
    const limit = Math.min(
      Number(req.query.limit) || 20,
      50
    );

    const posts = await Post.find()
      .populate("author", "username displayName avatar")
      .populate("comments.user", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo feed"
    });
  }
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username displayName avatar")
    .populate("comments.user", "username displayName avatar");

  if (!post) {
    return res.status(404).json({
      error: "Publicación no encontrada"
    });
  }

  res.json({ post });
});

router.post("/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      error: "Publicación no encontrada"
    });
  }

  const index = post.likes.findIndex(
    id => String(id) === String(req.user.id)
  );

  if (index === -1) {
    post.likes.push(req.user.id);
  } else {
    post.likes.splice(index, 1);
  }

  await post.save();

  res.json({
    liked: index === -1,
    likes: post.likes.length
  });
});

router.post("/:id/comments", auth, async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({
      error: "El comentario está vacío"
    });
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      error: "Publicación no encontrada"
    });
  }

  post.comments.push({
    user: req.user.id,
    text: text.trim()
  });

  await post.save();

  await post.populate(
    "comments.user",
    "username displayName avatar"
  );

  res.status(201).json({
    comment: post.comments[post.comments.length - 1]
  });
});

router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    author: req.user.id
  });

  if (!post) {
    return res.status(404).json({
      error: "Publicación no encontrada o sin permisos"
    });
  }

  await post.deleteOne();

  res.json({
    deleted: true
  });
});

module.exports = router;
