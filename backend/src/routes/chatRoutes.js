const r = require("express").Router();
const { authenticate } = require("../middleware/auth");
const c = require("../controllers/chatController");

r.post("/", authenticate, c.chat);

module.exports = r;