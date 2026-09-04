const OpenAI = require("openai");
const {
  getAIProviderConfig
} = require("../../config/aiProviders");

const MAX_PROMPT_LENGTH = 10000;
const MAX_OUTPUT_TOKENS = 3000;
const SCRIPT_TYPES = new Set([
  "video",
  "reel",
  "youtube",
  "advertisement",
  "story",
  "presentation",
  "custom"
]);

function normalizeScriptStructure(value) {
  if (!value || typeof value !== "object") {
    throw new Error("SCRIPT_INVALID_RESPONSE");
  }

  if (
    typeof value.title !== "string" ||
    !value.title.trim() ||
    !Array.isArray(value.scenes) ||
    value.scenes.length === 0
  ) {
    throw new Error("SCRIPT_INVALID_RESPONSE");
  }

  const scenes = value.scenes.map((scene, index) => ({
    number: Number.isInteger(scene?.number)
      ? scene.number
      : index + 1,
    heading: typeof scene?.heading === "string"
      ? scene.heading.trim()
      : "",
    action: typeof scene?.action === "string"
      ? scene.action.trim()
      : "",
    characters: Array.isArray(scene?.characters)
      ? scene.characters.filter(
          character => typeof character === "string"
        )
      : [],
    dialogue: Array.isArray(scene?.dialogue)
      ? scene.dialogue
          .filter(line => line && typeof line === "object")
          .map(line => ({
            character: typeof line.character === "string"
              ? line.character.trim()
              : "",
            text: typeof line.text === "string"
              ? line.text.trim()
              : "",
            direction: typeof line.direction === "string"
              ? line.direction.trim()
              : ""
          }))
      : [],
    directions: typeof scene?.directions === "string"
      ? scene.directions.trim()
      : "",
    transition: typeof scene?.transition === "string"
      ? scene.transition.trim()
      : ""
  }));

  return {
    title: value.title.trim(),
    logline: typeof value.logline === "string"
      ? value.logline.trim()
      : "",
    narrative: {
      beginning: typeof value.narrative?.beginning === "string"
        ? value.narrative.beginning.trim()
        : "",
      middle: typeof value.narrative?.middle === "string"
        ? value.narrative.middle.trim()
        : "",
      ending: typeof value.narrative?.ending === "string"
        ? value.narrative.ending.trim()
        : ""
    },
    scenes,
    closing: typeof value.closing === "string"
      ? value.closing.trim()
      : ""
  };
}

function formatScriptResult(structure) {
  const lines = [
    `TITULO: ${structure.title}`,
    `PREMISA: ${structure.logline}`,
    "",
    "ESTRUCTURA NARRATIVA",
    `INICIO: ${structure.narrative.beginning}`,
    `DESARROLLO: ${structure.narrative.middle}`,
    `CIERRE: ${structure.narrative.ending}`,
    ""
  ];

  structure.scenes.forEach(scene => {
    lines.push(`ESCENA ${scene.number}: ${scene.heading}`);
    lines.push(`ACCION: ${scene.action}`);

    if (scene.characters.length > 0) {
      lines.push(`PERSONAJES: ${scene.characters.join(", ")}`);
    }

    scene.dialogue.forEach(line => {
      const direction = line.direction
        ? ` (${line.direction})`
        : "";
      lines.push(`${line.character}${direction}: ${line.text}`);
    });

    if (scene.directions) {
      lines.push(`INDICACIONES: ${scene.directions}`);
    }

    if (scene.transition) {
      lines.push(`TRANSICION: ${scene.transition}`);
    }

    lines.push("");
  });

  lines.push(`CIERRE: ${structure.closing}`);
  return lines.join("\n").trim();
}

async function generateScript({
  prompt,
  type = "custom",
  genre = "general",
  format = "standard",
  durationMinutes = 5,
  tone = "",
  audience = ""
}) {
  const provider =
    getAIProviderConfig("script");

  if (!provider.configured) {
    throw new Error("OPENROUTER_API_KEY_NOT_CONFIGURED");
  }

  if (
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    throw new Error("PROMPT_REQUIRED");
  }

  const cleanPrompt = prompt.trim();

  if (!SCRIPT_TYPES.has(type)) {
    throw new Error("INVALID_SCRIPT_TYPE");
  }

  if (cleanPrompt.length > MAX_PROMPT_LENGTH) {
    throw new Error("PROMPT_TOO_LONG");
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

  try {
    const response =
      await client.chat.completions.create({
        model: provider.model,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content:
              "Eres un guionista profesional de Kronos Social AI. Devuelve únicamente un JSON válido, sin markdown ni texto adicional, con esta forma exacta: {\"title\":\"string\",\"logline\":\"string\",\"narrative\":{\"beginning\":\"string\",\"middle\":\"string\",\"ending\":\"string\"},\"scenes\":[{\"number\":1,\"heading\":\"INT./EXT. - LUGAR - MOMENTO\",\"action\":\"string\",\"characters\":[\"string\"],\"dialogue\":[{\"character\":\"string\",\"text\":\"string\",\"direction\":\"string\"}],\"directions\":\"string\",\"transition\":\"string\"}],\"closing\":\"string\"}. Escribe en español, adapta el ritmo a la duración, conserva una estructura narrativa clara y no inventes datos concretos que el usuario no haya proporcionado."
          },
          {
            role: "user",
            content:
              `Tipo: ${type}\nGénero: ${genre}\nFormato: ${format}\nDuración objetivo: ${durationMinutes} minutos\nTono: ${tone || "por definir"}\nAudiencia: ${audience || "general"}\n\nSolicitud: ${cleanPrompt}`
          }
        ]
      });

    const rawContent =
      response.choices?.[0]?.message?.content;
    const content =
      typeof rawContent === "string"
        ? rawContent.trim()
        : "";

    if (!content) {
      throw new Error("SCRIPT_INVALID_RESPONSE");
    }

    let structure;

    try {
      structure = normalizeScriptStructure(
        JSON.parse(content)
      );
    } catch (error) {
      if (error?.message === "SCRIPT_INVALID_RESPONSE") {
        throw error;
      }

      throw new Error("SCRIPT_INVALID_RESPONSE");
    }

    return {
      result: formatScriptResult(structure),
      structure
    };
  } catch (error) {
    console.error(
      "SCRIPT_PROVIDER_ERROR:",
      error?.message || error
    );

    if (error?.message === "SCRIPT_INVALID_RESPONSE") {
      throw error;
    }

    throw new Error("SCRIPT_PROVIDER_ERROR");
  }
}

module.exports = {
  generateScript,
  normalizeScriptStructure,
  formatScriptResult
};
