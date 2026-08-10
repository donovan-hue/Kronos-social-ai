async function generateVideo(prompt) {
  /*
   * Adaptador de proveedor.
   *
   * El backend queda desacoplado del proveedor concreto.
   * Cuando se configure un proveedor compatible, esta función
   * será el único punto que necesitaremos cambiar.
   */

  if (!process.env.VIDEO_API_KEY) {
    return {
      status: "queued",
      videoUrl: "",
      development: true,
      message:
        "Configura VIDEO_API_KEY y el proveedor de video para activar la generación."
    };
  }

  throw new Error(
    "VIDEO_PROVIDER_NOT_CONFIGURED"
  );
}

module.exports = {
  generateVideo
};
