const express = require("express");
const mongoose = require("mongoose");
const Notification = require("./Notification");
const auth = require("../../middleware/auth");
const { requireUser } = require("../../middleware/permissions");

const router = express.Router();
const NOTIFICATION_LIMIT = 100;

router.get("/", auth, requireUser, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
      .populate("actor", "username displayName avatar")
      .populate("post", "_id content")
      .sort({ createdAt: -1 })
      .limit(NOTIFICATION_LIMIT)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    return res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error(
      "GET_NOTIFICATIONS_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error obteniendo notificaciones"
    });
  }
});

router.patch("/read-all", auth, requireUser, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        read: false
      },
      {
        $set: {
          read: true
        }
      }
    );

    return res.json({
      ok: true
    });
  } catch (error) {
    console.error(
      "MARK_ALL_NOTIFICATIONS_READ_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error actualizando notificaciones"
    });
  }
});

router.patch("/:notificationId/read", auth, requireUser, async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({
        error: "ID de notificación inválido"
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: req.user.id
      },
      {
        $set: {
          read: true
        }
      },
      {
        new: true
      }
    ).lean();

    if (!notification) {
      return res.status(404).json({
        error: "Notificación no encontrada"
      });
    }

    return res.json({
      notification
    });
  } catch (error) {
    console.error(
      "MARK_NOTIFICATION_READ_ERROR:",
      error
    );

    return res.status(500).json({
      error: "Error actualizando notificación"
    });
  }
});

module.exports = router;
