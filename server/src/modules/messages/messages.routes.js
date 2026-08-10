const express = require("express");
const Message = require("./Message");
const auth = require("../../middleware/auth");

const router = express.Router();

router.get("/:userId", auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      {
        sender: req.user.id,
        receiver: req.params.userId
      },
      {
        sender: req.params.userId,
        receiver: req.user.id
      }
    ]
  })
    .populate("sender", "username displayName avatar")
    .populate("receiver", "username displayName avatar")
    .sort({ createdAt: 1 })
    .limit(200);

  res.json({ messages });
});

router.post("/:userId", auth, async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({
      error: "El mensaje está vacío"
    });
  }

  const message = await Message.create({
    sender: req.user.id,
    receiver: req.params.userId,
    text: text.trim()
  });

  await message.populate("sender", "username displayName avatar");
  await message.populate("receiver", "username displayName avatar");

  const io = req.app.get("io");

  if (io) {
    io.to(`user:${req.params.userId}`).emit(
      "message:new",
      message
    );
  }

  res.status(201).json({ message });
});

router.patch("/:userId/read", auth, async (req, res) => {
  await Message.updateMany(
    {
      sender: req.params.userId,
      receiver: req.user.id,
      read: false
    },
    {
      $set: { read: true }
    }
  );

  res.json({ ok: true });
});

module.exports = router;
