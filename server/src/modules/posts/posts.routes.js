const express = require("express");
const mongoose = require("mongoose");

const Post = require("./Post");
const auth = require("../../middleware/auth");
const { createNotification } = require("../notifications/notification.service");

const router = express.Router();

router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validId(userId)) {
      return res.status(400).json({
        error: "ID de usuario inválido"
      });
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find({ author: userId })
        .populate("author", AUTHOR_FIELDS)
        .populate("comments.user", COMMENT_USER_FIELDS)
        .sort({ createdAt: -1 })
        .limit(FEED_LIMIT)
        .lean(),
      Post.countDocuments({ author: userId })
    ]);

    return res.status(200).json({
      posts: posts.map(post =>
        normalizePost(post, req.user.id)
      ),
      totalPosts
    });
  } catch (error) {
    console.error("GET_USER_POSTS_ERROR:", error);

    return res.status(500).json({
      error: "Error obteniendo publicaciones del usuario"
    });
  }
});

router.get("/:postId", auth, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!validId(postId)) {
      return res.status(400).json({
        error: "ID de publicación inválido"
      });
    }

    const post = await Post.findById(postId)
      .populate("author", AUTHOR_FIELDS)
      .populate(
        "comments.user",
        COMMENT_USER_FIELDS
      )
      .lean();

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada"
      });
    }

    return res.status(200).json({
      post: normalizePost(
        post,
        req.user.id
      )
    });
  } catch (error) {
    console.error(
      "GET_POST_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error obteniendo publicación"
    });
  }
});

const FEED_LIMIT = 50;
const MAX_POST_LENGTH = 5000;
const MAX_COMMENT_LENGTH = 1000;

const AUTHOR_FIELDS = "username displayName avatar";
const COMMENT_USER_FIELDS = "username displayName avatar";

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizePost(post, currentUserId) {
  const likes = Array.isArray(post.likes) ? post.likes : [];

  const liked = likes.some(
    (likeUserId) =>
      String(likeUserId) === String(currentUserId)
  );

  return {
    ...post,
    likesCount: likes.length,
    liked
  };
}

/**
 * GET /api/posts
 *
 * Obtiene el feed principal.
 *
 * La API conserva los datos reales de MongoDB y añade:
 * - likesCount
 * - liked
 *
 * El frontend debe utilizar estos dos campos para representar
 * el estado del like del usuario actual.
 */
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", AUTHOR_FIELDS)
      .populate("comments.user", COMMENT_USER_FIELDS)
      .sort({ createdAt: -1 })
      .limit(FEED_LIMIT)
      .lean();

    const normalizedPosts = posts.map((post) =>
      normalizePost(post, req.user.id)
    );

    return res.status(200).json({
      posts: normalizedPosts
    });
  } catch (error) {
    console.error("GET_POSTS_ERROR:", error);

    return res.status(500).json({
      error: "Error obteniendo publicaciones"
    });
  }
});

/**
 * POST /api/posts
 *
 * Crea una publicación.
 */
router.post("/", auth, async (req, res) => {
  try {
    const content =
      typeof req.body?.content === "string"
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

    if (!validId(req.user.id)) {
      return res.status(401).json({
        error: "Usuario autenticado inválido"
      });
    }

    const post = await Post.create({
      content,
      author: req.user.id,
      likes: [],
      comments: []
    });

    await post.populate(
      "author",
      AUTHOR_FIELDS
    );

    const postObject = post.toObject();

    return res.status(201).json({
      post: {
        ...postObject,
        likesCount: 0,
        liked: false
      }
    });
  } catch (error) {
    console.error("CREATE_POST_ERROR:", error);

    return res.status(500).json({
      error: "Error creando publicación"
    });
  }
});

/**
 * POST /api/posts/:postId/comments
 *
 * Crea un comentario dentro de una publicación.
 */
router.post(
  "/:postId/comments",
  auth,
  async (req, res) => {
    try {
      const { postId } = req.params;

      if (!validId(postId)) {
        return res.status(400).json({
          error: "ID de publicación inválido"
        });
      }

      if (!validId(req.user.id)) {
        return res.status(401).json({
          error: "Usuario autenticado inválido"
        });
      }

      const content =
        typeof req.body?.content === "string"
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
        .populate("author", AUTHOR_FIELDS)
        .populate(
          "comments.user",
          COMMENT_USER_FIELDS
        );

      if (!post) {
        return res.status(404).json({
          error: "Publicación no encontrada"
        });
      }

      const postObject = post.toObject();

      await createNotification({
        recipient: post.author._id,
        actor: req.user.id,
        type: "comment",
        post: post._id,
        io: req.app.get("io")
      });

      return res.status(201).json({
        post: {
          ...postObject,
          likesCount: Array.isArray(postObject.likes)
            ? postObject.likes.length
            : 0,
          liked: Array.isArray(postObject.likes)
            ? postObject.likes.some(
                (likeUserId) =>
                  String(likeUserId) ===
                  String(req.user.id)
              )
            : false
        }
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
  }
);

/**
 * POST /api/posts/:postId/like
 *
 * Toggle atómico de like.
 *
 * Si el usuario ya dio like:
 *   -> elimina su ID.
 *
 * Si todavía no dio like:
 *   -> agrega su ID.
 *
 * La operación se ejecuta dentro de MongoDB mediante
 * un update pipeline para evitar el patrón inseguro:
 *
 *   find -> modificar -> save
 *
 * La respuesta siempre contiene el estado real resultante.
 */
router.post(
  "/:postId/like",
  auth,
  async (req, res) => {
    try {
      const { postId } = req.params;

      if (!validId(postId)) {
        return res.status(400).json({
          error: "ID de publicación inválido"
        });
      }

      if (!validId(req.user.id)) {
        return res.status(401).json({
          error: "Usuario autenticado inválido"
        });
      }

      const userId = new mongoose.Types.ObjectId(
        req.user.id
      );

      const updatedPost =
        await Post.findByIdAndUpdate(
          postId,
          [
            {
              $set: {
                likes: {
                  $cond: [
                    {
                      $in: [
                        userId,
                        {
                          $ifNull: ["$likes", []]
                        }
                      ]
                    },
                    {
                      $filter: {
                        input: {
                          $ifNull: ["$likes", []]
                        },
                        as: "likeUserId",
                        cond: {
                          $ne: [
                            "$$likeUserId",
                            userId
                          ]
                        }
                      }
                    },
                    {
                      $concatArrays: [
                        {
                          $ifNull: ["$likes", []]
                        },
                        [userId]
                      ]
                    }
                  ]
                }
              }
            }
          ],
          {
            new: true
          }
        )
          .select("_id likes author")
          .lean();

      if (!updatedPost) {
        return res.status(404).json({
          error: "Publicación no encontrada"
        });
      }

      const likes = Array.isArray(updatedPost.likes)
        ? updatedPost.likes
        : [];

      const liked = likes.some(
        (likeUserId) =>
          String(likeUserId) === String(userId)
      );

      if (liked) {
        await createNotification({
          recipient: updatedPost.author,
          actor: req.user.id,
          type: "like",
          post: updatedPost._id,
          io: req.app.get("io")
        });
      }

      return res.status(200).json({
        postId: String(updatedPost._id),
        liked,
        likesCount: likes.length
      });
    } catch (error) {
      console.error(
        "LIKE_POST_ERROR:",
        error
      );

      return res.status(500).json({
        error: "Error actualizando like"
      });
    }
  }
);

module.exports = router;
