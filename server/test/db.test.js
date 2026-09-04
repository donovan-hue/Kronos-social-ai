const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

test("connectDB crea una base de datos temporal cuando no hay Mongo local", async () => {
  const previousUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = "";

  try {
    await connectDB();
    assert.strictEqual(mongoose.connection.readyState, 1);
  } finally {
    await mongoose.disconnect();
    process.env.MONGODB_URI = previousUri;
  }
});
