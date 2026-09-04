const { GoogleGenAI } = require("@google/genai");
const {
  getAIProviderConfig
} = require("../../../config/aiProviders");

let gemini = null;

function getGemini() {
  if (!gemini) {
    const provider =
      getAIProviderConfig("chat");

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
  messages,
  model
}) {
  const client = getGemini();
  const provider =
    getAIProviderConfig("chat");
  const selectedModel = model || provider.model;

  const systemMessage = messages.find(
    (message) => message.role === "system"
  );

  const conversation = messages
    .filter((message) => message.role !== "system")
    .map((message) => {
      return `${message.role === "assistant" ? "Modelo" : "Usuario"}: ${message.content}`;
    })
    .join("\n\n");

  const prompt = [
    systemMessage?.content
      ? `INSTRUCCIONES DEL SISTEMA:\n${systemMessage.content}`
      : "",
    conversation
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
    usage: null
  };
}

module.exports = {
  generateResponse
};
