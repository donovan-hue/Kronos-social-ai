const express = require("express");
const User = require("./User");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/search", auth, async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q) {
    return res.json({ users: [] });
  }

  const users = await User.find({
    $or: [
      {
        username: {
          $regex: q,
          $options: "i"
        }
      },
      {
        displayName: {
          $regex: q,
          $options: "i"
        }
      }
    ]
  })
    .select(
      "username displayName bio avatar followers following"
    )
    .limit(20)
    .lean();

  res.json({
    users
  });
});

router.get("/:username", auth, async (req, res) => {
  const user = await User.findOne({
    username: req.params.username.toLowerCase()
  })
    .select(
      "username displayName bio avatar followers following createdAt"
    )
    .lean();

  if (!user) {
    return res.status(404).json({
      error: "Usuario no encontrado"
    });
  }

  res.json({
    user: {
      ...user,
      followersCount:
        user.followers?.length || 0,
      followingCount:
        user.following?.length || 0,
      isFollowing:
        user.followers?.some(
          id => String(id) === String(req.user.id)
        ) || false
    }
  });
});

router.post(
  "/:userId/follow",
  auth,
  async (req, res) => {
    if (
      String(req.params.userId) ===
      String(req.user.id)
    ) {
      return res.status(400).json({
        error: "No puedes seguirte a ti mismo"
      });
    }

    const target = await User.findById(
      req.params.userId
    );

    const current = await User.findById(
      req.user.id
    );

    if (!target || !current) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    const alreadyFollowing =
      current.following.some(
        id =>
          String(id) ===
          String(target._id)
      );

    if (alreadyFollowing) {
      current.following =
        current.following.filter(
          id =>
            String(id) !==
            String(target._id)
        );

      target.followers =
        target.followers.filter(
          id =>
            String(id) !==
            String(current._id)
        );
    } else {
      current.following.push(
        target._id
      );

      target.followers.push(
        current._id
      );
    }

    await Promise.all([
      current.save(),
      target.save()
    ]);

    res.json({
      following: !alreadyFollowing,
      followersCount:
        target.followers.length
    });
  }
);

module.exports = router;
