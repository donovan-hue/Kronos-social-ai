const { GoogleGenAI } = require("@google/genai");
const {
  getAIProviderConfig
} = require("../../../config/aiProviders");

let gemini = null;

function getGemini() {
  if (!gemini) {
    const provider = getAIProviderConfig("chat");

    if (!provider.configured) {
      throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
    }

    gemini = new GoogleGenAI({
      apiKey: provider.apiKey
    });
  }

  return gemini;
}

async function generateResponse({
  message,
  history = [],
  model
}) {
  if (typeof message !== "string" || !message.trim()) {
    throw new Error("MESSAGE_REQUIRED");
  }

  const client = getGemini();
  const provider = getAIProviderConfig("chat");
  const selectedModel = model || provider.model;

  const normalizedHistory = Array.isArray(history)
    ? history.filter(
        item =>
          item &&
          ["user", "assistant", "system"].includes(item.role) &&
          typeof item.content === "string" &&
          item.content.trim()
      )
    : [];

  const systemMessages = normalizedHistory
    .filter(item => item.role === "system")
    .map(item => item.content.trim());

  const conversation = normalizedHistory
    .filter(item => item.role !== "system")
    .map(item => {
      const role =
        item.role === "assistant"
          ? "Modelo"
          : "Usuario";

      return `${role}: ${item.content.trim()}`;
    });

  conversation.push(`Usuario: ${message.trim()}`);

  const prompt = [
    systemMessages.length
      ? `INSTRUCCIONES DEL SISTEMA:\n${systemMessages.join("\n\n")}`
      : "",
    conversation.join("\n\n"),
    "Modelo:"
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await client.models.generateContent({
    model: selectedModel,
    contents: prompt
  });

  return {
    text: response.text || "",
    model: selectedModel,
    usage: response.usageMetadata || null
  };
}

module.exports = {
  generateResponse
};
