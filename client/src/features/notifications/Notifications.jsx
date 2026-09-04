import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function getAuthConfig() {
  const token = localStorage.getItem("kronos_token");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
}

function formatDate(date) {
  if (!date) {
    return "";
  }

  try {
    return new Date(date).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function getNotificationText(notification) {
  const actor =
    notification.actor?.displayName ||
    notification.actor?.username ||
    "Alguien";

  if (notification.type === "follow") {
    return `${actor} comenzó a seguirte.`;
  }

  if (notification.type === "like") {
    return `${actor} indicó que le gusta tu publicación.`;
  }

  return `${actor} comentó tu publicación.`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/notifications`,
        getAuthConfig()
      );

      setNotifications(
        Array.isArray(response.data?.notifications)
          ? response.data.notifications
          : []
      );
      setUnreadCount(
        typeof response.data?.unreadCount === "number"
          ? response.data.unreadCount
          : 0
      );
    } catch (requestError) {
      console.error(
        "KRONOS_NOTIFICATIONS_LOAD_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudieron cargar las notificaciones."
      );
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      await axios.patch(
        `${API}/notifications/${notificationId}/read`,
        {},
        getAuthConfig()
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (requestError) {
      console.error(
        "KRONOS_NOTIFICATION_READ_ERROR:",
        requestError
      );
    }
  }

  async function markAllAsRead() {
    if (!unreadCount) {
      return;
    }

    try {
      await axios.patch(
        `${API}/notifications/read-all`,
        {},
        getAuthConfig()
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadCount(0);
    } catch (requestError) {
      console.error(
        "KRONOS_NOTIFICATIONS_READ_ALL_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudieron marcar las notificaciones."
      );
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <section className="page">
        <h2>Notificaciones</h2>
        <p>Cargando notificaciones...</p>
      </section>
    );
  }

  return (
    <section className="page notifications-page">
      <header className="notifications-header">
        <h2>Notificaciones</h2>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={!unreadCount}
        >
          Marcar todas como leídas
        </button>
      </header>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      {notifications.length === 0 ? (
        <p>No tienes notificaciones.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const content = (
              <>
                <strong>
                  {getNotificationText(notification)}
                </strong>
                <small>{formatDate(notification.createdAt)}</small>
              </>
            );

            const destination = notification.post
              ? `/post/${notification.post._id}`
              : `/users/${notification.actor?._id}`;

            return (
              <article
                className={`notification ${
                  notification.read
                    ? "notification-read"
                    : "notification-unread"
                }`}
                key={notification._id}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification._id);
                  }
                }}
              >
                <Link to={destination}>{content}</Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
