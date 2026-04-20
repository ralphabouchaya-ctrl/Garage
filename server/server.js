require("dotenv").config();
const express = require("express");
const db = require("./db");
const crypto = require("crypto");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
// Test route


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Query users table
    const [rows] = await db.query(
      "SELECT u_id, email, password FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare hashed password
const sha2 = crypto.createHash("sha256").update(password).digest("hex");

const isMatch =
  await bcrypt.compare(password, user.password) ||
  user.password === sha2;
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});