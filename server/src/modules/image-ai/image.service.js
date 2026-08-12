const OpenAI = require("openai");

async function generateImage(prompt) {
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
        process.env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "Kronos Social AI"
    }
  });

  const response = await client.images.generate({
    model,
    prompt,
    size: "1024x1024"
  });

  const image = response.data?.[0];

  if (!image) {
    throw new Error("OPENROUTER_NO_IMAGE");
  }

  if (image.url) {
    return {
      url: image.url,
      development: false,
      model
    };
  }

  if (image.b64_json) {
    return {
      url: `data:image/png;base64,${image.b64_json}`,
      development: false,
      model
    };
  }

  throw new Error("OPENROUTER_IMAGE_FORMAT_UNKNOWN");
}

module.exports = {
  generateImage
};
