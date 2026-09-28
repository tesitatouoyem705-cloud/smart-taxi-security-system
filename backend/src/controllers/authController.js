const User = require("../models/User");
const { hashPassword, comparePassword, createToken } = require("../services/authService");

function sanitizeUser(u) {
  const json = u.toJSON ? u.toJSON() : u;
  delete json.password;
  return json;
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password, role = "PASSENGER", emergencyContacts } = req.body;
    if (await User.findOne({ where: { email } })) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password: await hashPassword(password),
      role: role.toUpperCase(),
      emergencyContacts: emergencyContacts ? (typeof emergencyContacts === "string" ? emergencyContacts : JSON.stringify(emergencyContacts)) : "[]"
    });

    res.status(201).json({
      message: "Account created successfully",
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user || !(await comparePassword(req.body.password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: `Account is ${user.status.toLowerCase()}` });
    }

    res.json({
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };

