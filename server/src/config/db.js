const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI no configurada. Continuando sin MongoDB.");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB conectado");
}

module.exports = connectDB;
