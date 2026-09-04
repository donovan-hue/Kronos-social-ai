const PROVIDER_CONFIG = {
  chat: {
    provider: "gemini",
    apiKeyEnv: "GEMINI_API_KEY",
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-3.6-flash"
  },
  image: {
    provider: "openrouter",
    apiKeyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_IMAGE_MODEL",
    defaultModel: "google/gemini-2.5-flash-image"
  },
  script: {
    provider: "openrouter",
    apiKeyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    defaultModel: "openrouter/free"
  },
  video: {
    provider: "video-api",
    apiKeyEnv: "VIDEO_API_KEY",
    endpointEnv: "VIDEO_API_URL",
    modelEnv: "VIDEO_MODEL",
    defaultModel: "video-generation"
  }
};

function getAIProviderConfig(capability) {
  const config = PROVIDER_CONFIG[capability];

  if (!config) {
    throw new Error("AI_CAPABILITY_NOT_SUPPORTED");
  }

  const apiKey = config.apiKeyEnv
    ? process.env[config.apiKeyEnv]
    : "";
  const endpoint = config.endpointEnv
    ? process.env[config.endpointEnv]
    : "";
  const model =
    process.env[config.modelEnv] ||
    config.defaultModel;

  return {
    capability,
    provider: config.provider,
    apiKey,
    endpoint,
    model,
    configured: Boolean(
      apiKey &&
        (!config.endpointEnv || endpoint)
    )
  };
}

function getAIProviderCatalog() {
  return Object.keys(PROVIDER_CONFIG).map(
    (capability) => {
      const config = getAIProviderConfig(capability);

      return {
        capability: config.capability,
        provider: config.provider,
        model: config.model,
        configured: config.configured
      };
    }
  );
}

module.exports = {
  getAIProviderConfig,
  getAIProviderCatalog
};
