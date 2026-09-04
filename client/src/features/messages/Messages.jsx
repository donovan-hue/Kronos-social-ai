import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getSocket } from "../../services/socket";

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

function getCurrentUserId() {
  try {
    const user = JSON.parse(
      localStorage.getItem("kronos_user") || "null"
    );

    return String(user?._id || user?.id || "");
  } catch {
    return "";
  }
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

function getOtherUser(messages, currentUserId, fallbackId) {
  const message = messages.find((item) => {
    const senderId = String(item.sender?._id || item.sender || "");
    const receiverId = String(
      item.receiver?._id || item.receiver || ""
    );

    return senderId !== currentUserId
      ? senderId
      : receiverId !== currentUserId
        ? receiverId
        : false;
  });

  if (!message) {
    return {
      _id: fallbackId,
      displayName: "Conversación",
      username: "",
      avatar: "",
    };
  }

  const other =
    String(message.sender?._id || message.sender || "") ===
    currentUserId
      ? message.receiver
      : message.sender;

  return typeof other === "object"
    ? other
    : {
        _id: other,
        displayName: "Conversación",
        username: "",
        avatar: "",
      };
}

export default function Messages() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = getCurrentUserId();

  async function loadConversations() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/messages`,
        getAuthConfig()
      );

      setConversations(
        Array.isArray(response.data?.conversations)
          ? response.data.conversations
          : []
      );
    } catch (requestError) {
      console.error(
        "KRONOS_CONVERSATIONS_LOAD_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudieron cargar las conversaciones."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    if (!userId) {
      setError("La conversación no es válida.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/messages/${userId}`,
        getAuthConfig()
      );

      const loadedMessages = Array.isArray(
        response.data?.messages
      )
        ? response.data.messages
        : [];

      setMessages(loadedMessages);

      await axios.patch(
        `${API}/messages/${userId}/read`,
        {},
        getAuthConfig()
      );
    } catch (requestError) {
      console.error(
        "KRONOS_MESSAGES_LOAD_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudieron cargar los mensajes."
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();

    const text = content.trim();

    if (!text || sending || !userId) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await axios.post(
        `${API}/messages/${userId}`,
        { text },
        getAuthConfig()
      );

      if (!response.data?.message) {
        throw new Error("INVALID_MESSAGE_RESPONSE");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        response.data.message,
      ]);
      setContent("");
    } catch (requestError) {
      console.error(
        "KRONOS_MESSAGE_SEND_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo enviar el mensaje."
      );
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadMessages();
    } else {
      loadConversations();
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    const socket = getSocket();

    if (!socket) {
      return undefined;
    }

    function handleNewMessage(message) {
      const senderId = String(
        message?.sender?._id || message?.sender || ""
      );
      const receiverId = String(
        message?.receiver?._id || message?.receiver || ""
      );
      const isCurrentConversation =
        (senderId === currentUserId && receiverId === String(userId)) ||
        (receiverId === currentUserId && senderId === String(userId));

      if (!isCurrentConversation || !message?._id) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.some(
          (currentMessage) =>
            currentMessage._id === message._id
        )
          ? currentMessages
          : [...currentMessages, message]
      );
    }

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [currentUserId, userId]);

  if (loading) {
    return (
      <section className="page">
        <h2>Mensajes</h2>
        <p>
          {userId
            ? "Cargando conversación..."
            : "Cargando conversaciones..."}
        </p>
      </section>
    );
  }

  if (!userId) {
    return (
      <section className="page messages-page">
        <header className="messages-header">
          <h2>Mensajes</h2>
          <p>Conversaciones recientes</p>
        </header>

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        {conversations.length === 0 ? (
          <p>Aún no tienes conversaciones.</p>
        ) : (
          <div className="conversation-list">
            {conversations.map((conversation) => {
              const user = conversation.user || {};
              const latestMessage =
                conversation.latestMessage || {};

              return (
                <Link
                  className="conversation-item"
                  to={`/messages/${user._id}`}
                  key={user._id}
                >
                  <strong>
                    {user.displayName ||
                      user.username ||
                      "Usuario"}
                  </strong>
                  {user.username && (
                    <span>@{user.username}</span>
                  )}
                  <p>{latestMessage.text}</p>
                  <small>
                    {formatDate(
                      latestMessage.createdAt
                    )}
                    {conversation.unreadCount > 0 &&
                      ` · ${conversation.unreadCount} sin leer`}
                  </small>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  const otherUser = getOtherUser(
    messages,
    currentUserId,
    userId
  );

  return (
    <section className="page messages-page">
      <header className="messages-header">
        <Link to={`/users/${userId}`}>
          Ver perfil
        </Link>
        <h2>
          {otherUser.displayName ||
            otherUser.username ||
            "Conversación"}
        </h2>
        {otherUser.username && (
          <p>@{otherUser.username}</p>
        )}
      </header>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <div className="messages-list" aria-live="polite">
        {messages.length === 0 ? (
          <p>Aún no hay mensajes.</p>
        ) : (
          messages.map((message) => {
            const senderId = String(
              message.sender?._id || message.sender || ""
            );

            return (
              <article
                className={`message ${
                  senderId === currentUserId
                    ? "message-own"
                    : "message-received"
                }`}
                key={message._id}
              >
                <p>{message.text}</p>
                <small>{formatDate(message.createdAt)}</small>
              </article>
            );
          })
        )}
      </div>

      <form className="message-composer" onSubmit={sendMessage}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5000}
          placeholder="Escribe un mensaje..."
          aria-label="Escribir mensaje"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}
