const { generateResponse } = require("./model.service");

async function chat({
  message,
  history = [],
  system = "Eres Kronos AI, un asistente inteligente integrado en Kronos Social AI."
}) {
  if (!message || typeof message !== "string") {
    throw new Error("El mensaje es obligatorio");
  }

  const messages = [
    {
      role: "system",
      content: system
    },
    ...history,
    {
      role: "user",
      content: message
    }
  ];

  return generateResponse({
    messages
  });
}

module.exports = {
  chat
};
