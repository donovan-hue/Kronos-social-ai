const OpenAI = require("openai");

const MAX_PROMPT_LENGTH = 10000;
const MAX_OUTPUT_TOKENS = 3000;

async function generateScript({ prompt, type = "custom" }) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY_NOT_CONFIGURED");
  }

  if (
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    throw new Error("PROMPT_REQUIRED");
  }

  const cleanPrompt = prompt.trim();

  if (cleanPrompt.length > MAX_PROMPT_LENGTH) {
    throw new Error("PROMPT_TOO_LONG");
  }

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

  try {
    const response =
      await client.chat.completions.create({
        model:
          process.env.OPENROUTER_MODEL ||
          "openrouter/free",
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          {
            role: "system",
            content:
              "Eres el asistente de inteligencia artificial de Kronos Social AI. Genera scripts claros, útiles y bien estructurados en español."
          },
          {
            role: "user",
            content:
              `Tipo de script: ${type}\n\nSolicitud: ${cleanPrompt}`
          }
        ]
      });

    const content =
      response.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("OPENROUTER_EMPTY_RESPONSE");
    }

    return content;
  } catch (error) {
    console.error(
      "SCRIPT_PROVIDER_ERROR:",
      error?.message || error
    );

    if (
      error?.message ===
      "OPENROUTER_EMPTY_RESPONSE"
    ) {
      throw error;
    }

    throw new Error("SCRIPT_PROVIDER_ERROR");
  }
}

module.exports = {
  generateScript
};
