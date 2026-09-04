const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kronos_social_ai";

  try {
    await mongoose.connect(uri);
    console.log("MongoDB conectado");
    return mongoose.connection;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    console.warn(
      "MongoDB local no disponible. Usando fallback en memoria para desarrollo."
    );

    const { MongoMemoryServer } = require("mongodb-memory-server");
    const memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();

    mongoose.connection.once("disconnected", () => memoryServer.stop());
    await mongoose.connect(memoryUri);
    console.log("MongoDB en memoria conectado");

    return mongoose.connection;
  }
}

module.exports = connectDB;
