const AI_ERRORS = {
  PROMPT_REQUIRED: {
    status: 400,
    message: "El prompt es obligatorio"
  },
  INVALID_IMAGE_PROMPT: {
    status: 400,
    message: "El prompt de imagen es obligatorio"
  },
  INVALID_VIDEO_PROMPT: {
    status: 400,
    message: "El prompt de video es obligatorio"
  },
  INVALID_USER_ID: {
    status: 401,
    message: "Usuario autenticado inválido"
  },
  OPENROUTER_API_KEY_NOT_CONFIGURED: {
    status: 503,
    message: "El proveedor de IA no está configurado"
  },
  GEMINI_API_KEY_NOT_CONFIGURED: {
    status: 503,
    message: "El proveedor de IA no está configurado"
  },
  IMAGE_PROVIDER_UNAVAILABLE: {
    status: 503,
    message: "El proveedor de imágenes no está disponible"
  },
  SCRIPT_PROVIDER_ERROR: {
    status: 503,
    message: "El proveedor de guiones no está disponible"
  },
  VIDEO_PROVIDER_UNAVAILABLE: {
    status: 503,
    message: "El proveedor de video no está disponible"
  },
  VIDEO_INVALID_RESPONSE: {
    status: 502,
    message: "El proveedor de video devolvió una respuesta inválida"
  }
};

function getAIErrorResponse(error) {
  const code = error?.message || "AI_PROVIDER_ERROR";
  const knownError = AI_ERRORS[code];

  return {
    status: knownError?.status || 502,
    code,
    message:
      knownError?.message ||
      "No se pudo completar la operación de IA"
  };
}

module.exports = {
  getAIErrorResponse
};
