const OpenAI = require("openai");

async function generateScript({ prompt, type }) {
  if (!process.env.OPENAI_API_KEY) {
    return [
      "[MODO DESARROLLO]",
      "",
      `Tipo: ${type}`,
      `Solicitud: ${prompt}`,
      "",
      "Configura OPENAI_API_KEY para activar la generación real."
    ].join("\n");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content:
          "Eres un generador profesional de guiones. Produce guiones estructurados, claros y listos para producción. No inventes datos presentados como hechos."
      },
      {
        role: "user",
        content:
          `Tipo de contenido: ${type}\n\nSolicitud:\n${prompt}`
      }
    ]
  });

  return response.output_text || "";
}

module.exports = {
  generateScript
};
