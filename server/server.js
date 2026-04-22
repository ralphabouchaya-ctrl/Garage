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
app.get('/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customer');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH customers
app.get('/customers/search', async (req, res) => {
  const { query } = req.query;

  try {
    const [rows] = await db.query(
      `SELECT * FROM customer WHERE first_name LIKE ? OR email LIKE ?`,
      [`%${query}%`, `%${query}%`]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD customer
app.post('/customers', async (req, res) => {
  const { first_name, last_name, email, phone } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO customer (first_name,last_name,email,phone) VALUES (?,?,?,?)`,
      [first_name, last_name, email, phone]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE customer
app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone } = req.body;

  try {
    await db.query(
      `UPDATE customer SET first_name=?, last_name=?, email=?, phone=? WHERE cust_id=?`,
      [first_name, last_name, email, phone, id]
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET single customer
app.get('/customers/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM customer WHERE cust_id=?',
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/vehicles/customer/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM vehicle WHERE cust_id = ?",
      [id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/vehicles/search", async (req, res) => {
  const { query, cust_id } = req.query;

  try {
    const [rows] = await db.query(
      `SELECT * FROM vehicle 
       WHERE cust_id = ?
       AND (model LIKE ? OR plate_number LIKE ?)`,
      [cust_id, `%${query}%`, `%${query}%`]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/vehicles", async (req, res) => {
  const { cust_id, model, year, engine, gear, plate_number } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO vehicle 
      (cust_id, model, year, engine, gear, plate_number)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [cust_id, model, year, engine, gear, plate_number]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/vehicles/:id", async (req, res) => {
  const { id } = req.params;
  const { model, year, engine, gear, plate_number } = req.body;

  try {
    await db.query(
      `UPDATE vehicle 
       SET model=?, year=?, engine=?, gear=?, plate_number=? 
       WHERE vehc_id=?`,
      [model, year, engine, gear, plate_number, id]
    );

    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});