const VIDEO_API_URL = process.env.VIDEO_API_URL;
const VIDEO_API_KEY = process.env.VIDEO_API_KEY;
const VIDEO_MODEL =
  process.env.VIDEO_MODEL || "video-generation";

async function generateVideo(prompt) {
  if (
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    throw new Error("INVALID_VIDEO_PROMPT");
  }

  if (!VIDEO_API_URL || !VIDEO_API_KEY) {
    return {
      status: "queued",
      videoUrl: "",
      development: true,
      message:
        "El proveedor de video todavía no está configurado."
    };
  }

  let response;

try {
  response = await fetch(VIDEO_API_URL, {
    
  signal: AbortSignal.timeout(30000),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VIDEO_API_KEY}`
    },
    body: JSON.stringify({
      model: VIDEO_MODEL,
      prompt: prompt.trim()
    })
  });

  if (!response.ok) {
  console.error(
    "VIDEO_PROVIDER_ERROR:",
    response.status,
    response.statusText
  );

  throw new Error("VIDEO_PROVIDER_ERROR");
  }

  let data;

try {
  data = await response.json();
} catch {
  throw new Error("VIDEO_INVALID_RESPONSE");
}

  const videoUrl =
    data.videoUrl ||
    data.video_url ||
    data.url ||
    data.output?.videoUrl ||
    data.output?.video_url ||
    data.output?.url ||
    "";

  if (!videoUrl) {
    throw new Error("VIDEO_URL_NOT_FOUND");
  }

  return {
    status: "completed",
    videoUrl,
    development: false,
    model: VIDEO_MODEL
  };
}

module.exports = {
  generateVideo
};
