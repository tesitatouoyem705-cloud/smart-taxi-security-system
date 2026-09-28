const { chatWithGemini } = require("../services/geminiService");

async function chat(req, res, next) {
  try {
    const { message, context } = req.body;
    const response = await chatWithGemini(message, {
      ...(context || {}),
      userRole: req.user?.role || "PASSENGER",
      userName: req.user?.name || "User"
    });
    res.json(response);
  } catch (e) {
    next(e);
  }
}

module.exports = { chat };