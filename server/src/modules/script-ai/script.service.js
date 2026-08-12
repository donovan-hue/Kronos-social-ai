const OpenAI = require("openai");

async function generateScript({ prompt, type = "custom" }) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY_NOT_CONFIGURED");
  }

  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("PROMPT_REQUIRED");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.CLIENT_URL || "http://localhost:3000",
      "X-Title": "Kronos Social AI"
    }
  });

  const response = await client.chat.completions.create({
    model:
      process.env.OPENROUTER_MODEL ||
      "openrouter/free",

    messages: [
      {
        role: "system",
        content:
          "Eres el asistente de inteligencia artificial de Kronos Social AI. Genera scripts claros, útiles y bien estructurados en español."
      },
      {
        role: "user",
        content: `Tipo de script: ${type}\n\nSolicitud: ${prompt.trim()}`
      }
    ]
  });

  const content =
    response.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OPENROUTER_EMPTY_RESPONSE");
  }

  return content;
}

module.exports = {
  generateScript
};
