const {
  getAIProviderConfig
} = require("../../config/aiProviders");

async function generateVideo(prompt, apiKey) {
  if (
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    throw new Error("INVALID_VIDEO_PROMPT");
  }

  const provider =
    getAIProviderConfig("video");

  if (!provider.configured) {
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
  response = await fetch(provider.endpoint, {
    
  signal: AbortSignal.timeout(30000),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
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
    model: provider.model
  };
  } catch (error) {
  console.error(
    "VIDEO_PROVIDER_NETWORK_ERROR:",
    error?.message || error
  );

  throw new Error("VIDEO_PROVIDER_UNAVAILABLE");
}
}

module.exports = {
  generateVideo
};
