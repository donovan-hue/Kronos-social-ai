import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

export default function Profile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState("");

  const isOwnProfile = !id;

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const endpoint = id
        ? `${API}/users/${id}`
        : `${API}/users/me`;

      const response = await axios.get(
        endpoint,
        getAuthConfig()
      );

      const user = response.data;

      setProfile(user);

      setForm({
        displayName: user.displayName || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });

      if (Array.isArray(user.followers)) {
        const currentUser = JSON.parse(
          localStorage.getItem("kronos_user") || "null"
        );

        setFollowing(
          currentUser?._id
            ? user.followers.some(
                (followerId) =>
                  String(followerId) ===
                  String(currentUser._id)
              )
            : false
        );
      }

      await loadUserPosts(user._id);
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_LOAD_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo cargar el perfil."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadUserPosts(userId) {
    if (!userId) {
      return;
    }

    try {
      const response = await axios.get(
        `${API}/posts`,
        getAuthConfig()
      );

      const allPosts = Array.isArray(
        response.data?.posts
      )
        ? response.data.posts
        : [];

      const userPosts = allPosts.filter(
        (post) =>
          String(post.author?._id || post.author) ===
          String(userId)
      );

      setPosts(userPosts);
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_POSTS_ERROR:",
        requestError
      );
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await axios.patch(
        `${API}/users/me`,
        {
          displayName: form.displayName.trim(),
          bio: form.bio.trim(),
          avatar: form.avatar.trim(),
        },
        getAuthConfig()
      );

      const updatedUser = response.data;

      setProfile(updatedUser);

      localStorage.setItem(
        "kronos_user",
        JSON.stringify(updatedUser)
      );
    } catch (requestError) {
      console.error(
        "KRONOS_PROFILE_UPDATE_ERROR:",
        requestError
      );

      setError(
        requestError.response?.data?.error ||
          "No se pudo actualizar el perfil."
      );
    } finally {
      setSaving(false);
    }
  }
  async function toggleFollow() {
  if (!profile?._id || isOwnProfile) {
    return;
  }

  setError("");

  try {
    const response = await axios.post(
      `${API}/users/${profile._id}/follow`,
      {},
      getAuthConfig()
    );

    const newFollowing = Boolean(
      response.data?.following
    );

    setFollowing(newFollowing);

    setProfile((current) => {
      if (!current) {
        return current;
      }

      const currentUser = JSON.parse(
        localStorage.getItem("kronos_user") || "null"
      );

      const currentUserId = currentUser?._id;

      const followers = Array.isArray(
        current.followers
      )
        ? current.followers
        : [];

      if (!currentUserId) {
        return current;
      }

      const normalizedFollowers = followers.map(
        (followerId) => String(followerId)
      );

      const alreadyExists =
        normalizedFollowers.includes(
          String(currentUserId)
        );

      if (newFollowing && !alreadyExists) {
        return {
          ...current,
          followers: [
            ...followers,
            currentUserId
          ]
        };
      }

      if (!newFollowing && alreadyExists) {
        return {
          ...current,
          followers: followers.filter(
            (followerId) =>
              String(followerId) !==
              String(currentUserId)
          )
        };
      }

      return current;
    });
  } catch (requestError) {
    console.error(
      "KRONOS_PROFILE_FOLLOW_ERROR:",
      requestError
    );

    setError(
      requestError.response?.data?.error ||
        "No se pudo actualizar el seguimiento."
    );
  }
  }
