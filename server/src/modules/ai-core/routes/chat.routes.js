const express = require("express");
const { chat } = require("../services/chat.service");
const auth = require("../../../middleware/auth");
const aiLimiter = require("../../../middleware/aiLimiter");
const {
  getAIErrorResponse
} = require("../../../middleware/aiError");

const router = express.Router();

router.post("/chat", auth, aiLimiter, async (req, res) => {
  try {
    const { message, history, system } = req.body;

    const result = await chat({
      message,
      history,
      system
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Kronos AI chat error:", error);

    const aiError = getAIErrorResponse(error);

    res.status(aiError.status).json({
      success: false,
      error: aiError.message,
      code: aiError.code
    });
  }
});

module.exports = router;
