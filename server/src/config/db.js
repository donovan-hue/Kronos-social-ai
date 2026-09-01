const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI_NOT_CONFIGURED");
  }

  await mongoose.connect(uri);

  console.log("MongoDB conectado");
}

module.exports = connectDB;
