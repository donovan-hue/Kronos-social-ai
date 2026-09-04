const OpenAI = require("openai");
const ImageGeneration = require("./ImageGeneration");
const {
  getAIProviderConfig
} = require("../../config/aiProviders");

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

  const provider =
    getAIProviderConfig("image");

  if (!provider.configured) {
    await ImageGeneration.create({
      user: userId,
      prompt: prompt.trim(),
      model: provider.model,
      provider: provider.provider
    });

    return {
      url: "",
      development: true,
      model: provider.model,
      provider: provider.provider,
      message:
        "Configura OPENROUTER_API_KEY para activar la generación de imágenes."
    };
  }

  const client = new OpenAI({
    apiKey: provider.apiKey,
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
    model: provider.model,
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
    model: provider.model,
    provider: provider.provider,
    imageUrl: url
  });

  return {
    url,
    development: false,
    model: provider.model,
    provider: provider.provider
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
    provider: "upload",
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
