const { GoogleGenAI } = require("@google/genai");

let gemini = null;

function getGemini() {
  if (!gemini) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no configurada");
    }

    gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return gemini;
}

async function generateResponse({
  messages,
  model = "gemini-3.6-flash"
}) {
  const client = getGemini();

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
    model,
    contents: prompt
  });

  return {
    text: response.text || "",
    model,
    usage: null
  };
}

module.exports = {
  generateResponse
};
