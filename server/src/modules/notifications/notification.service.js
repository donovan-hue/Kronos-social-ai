const Notification = require("./Notification");

async function createNotification({
  recipient,
  actor,
  type,
  post = null,
  io
}) {
  if (!recipient || !actor || String(recipient) === String(actor)) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    post
  });

  await notification.populate(
    "actor",
    "username displayName avatar"
  );

  if (io) {
    io.to(`user:${recipient}`).emit(
      "notification:new",
      notification
    );
  }

  return notification;
}

module.exports = {
  createNotification
};
