const OpenAI = require("openai");

async function generateImage(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      url: "",
      development: true,
      message:
        "Configura OPENAI_API_KEY para activar la generación real de imágenes."
    };
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    prompt,
    size: "1024x1024"
  });

  const image = response.data?.[0];

  if (!image) {
    throw new Error("La API no devolvió una imagen");
  }

  if (image.url) {
    return {
      url: image.url,
      development: false
    };
  }

  if (image.b64_json) {
    return {
      url: `data:image/png;base64,${image.b64_json}`,
      development: false
    };
  }

  throw new Error("Formato de imagen no reconocido");
}

module.exports = {
  generateImage
};
