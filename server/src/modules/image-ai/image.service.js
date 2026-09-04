const OpenAI = require("openai");
const ImageGeneration = require("./ImageGeneration");

async function generateImage({ prompt, userId }) {
  if (
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    throw new Error("INVALID_IMAGE_PROMPT");
  }

  if (!userId) {
    throw new Error("INVALID_USER_ID");
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return {
      url: "",
      development: true,
      model: null,
      message:
        "Configura OPENROUTER_API_KEY para activar la generación de imágenes."
    };
  }

  const model =
    process.env.OPENROUTER_IMAGE_MODEL ||
    "google/gemini-2.5-flash-image";

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.CLIENT_URL ||
        "http://localhost:3000",
      "X-Title": "Kronos Social AI"
    }
  });
 let response;

try {
  response = await client.images.generate({
    model,
    prompt: prompt.trim(),
    size: "1024x1024"
  });
} catch (error) {
  console.error(
    "IMAGE_PROVIDER_ERROR:",
    error?.message || error
  );

  throw new Error("IMAGE_PROVIDER_UNAVAILABLE");
}
  const image = response.data?.[0];

  if (!image) {
    throw new Error("OPENROUTER_NO_IMAGE");
  }

  let url = "";

  if (image.url) {
    url = image.url;
  } else if (image.b64_json) {
    url = `data:image/png;base64,${image.b64_json}`;
  } else {
    throw new Error(
      "OPENROUTER_IMAGE_FORMAT_UNKNOWN"
    );
  }

  await ImageGeneration.create({
    user: userId,
    prompt: prompt.trim(),
    model,
    imageUrl: url
  });

  return {
    url,
    development: false,
    model
  };
}

async function uploadImage({ file, userId }) {
  if (!file || !file.buffer) {
    throw new Error("INVALID_IMAGE_FILE");
  }

  if (!userId) {
    throw new Error("INVALID_USER_ID");
  }

  const imageUrl =
    `data:${file.mimetype};base64,` +
    file.buffer.toString("base64");

  await ImageGeneration.create({
    user: userId,
    prompt: "Imagen subida por el usuario",
    model: "upload",
    imageUrl
  });

  return {
    url: imageUrl,
    development: false,
    model: "upload"
  };
}

module.exports = {
  generateImage,
  uploadImage
};
