require("dotenv").config();
const express = require("express");
const db = require("./db");
const crypto = require("crypto");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

// Test route
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const PORT = process.env.PORT || 5000;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT u_id, email, password, google_2fa FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // password check
    const sha2 = crypto.createHash("sha256").update(password).digest("hex");

    const isMatch =
      (await bcrypt.compare(password, user.password)) ||
      user.password === sha2;

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    //  2FA LOGIC STARTS HERE

    // ❗ No 2FA yet → go to QR setup
    if (!user.google_2fa) {
      return res.json({
        require2FASetup: true,
        userId: user.u_id,
        message: "Setup 2FA required"
      });
    }

    // ❗ Already has 2FA → go to verification screen
    return res.json({
      require2FAVerify: true,
      userId: user.u_id,
      message: "Enter 2FA code"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/2fa/verify", async (req, res) => {
  const { userId, token } = req.body;

  const [users] = await db.query(
    "SELECT google_2fa FROM user WHERE u_id = ?",
    [userId]
  );

  if (!users.length) {
    return res.status(404).json({ error: "User not found" });
  }

  const secret = users[0].google_2fa;

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1
  });

  if (!verified) {
    return res.status(400).json({ error: "Invalid code" });
  }

  const jwtToken = jwt.sign({ userId }, "SECRET_KEY");

  res.json({
    success: true,
    token: jwtToken
  });
});

app.get("/2fa/init/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT google_2fa FROM user WHERE u_id = ?",
      [userId]
    );

    const user = rows[0];

    // ✅ already has 2FA → no QR needed
    if (user.google_2fa) {
      return res.json({ qr: null });
    }

    // ❗ create new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: "GarageApp"
    });

    const qr = await QRCode.toDataURL(secret.otpauth_url);

    // save secret
    await db.query(
      "UPDATE user SET google_2fa = ? WHERE u_id = ?",
      [secret.base32, userId]
    );

    res.json({ qr });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customer  ORDER BY first_name ASC');
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
      `SELECT * FROM customer WHERE first_name LIKE ? OR email LIKE ?   ORDER BY first_name ASC`,
      [`${query}%`, `${query}%`]
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

app.get("/vehicles/customer/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        v.vehc_id,
        v.plate_number,
        v.year,
        v.gear,

        m.id AS model_id,
        m.name AS model_name,

        e.id AS engine_id,
        e.name AS engine_name,

        CONCAT(c.first_name, ' ', c.last_name) AS customer

      FROM vehicle v
      LEFT JOIN car_model m ON v.model_id = m.id
      LEFT JOIN engine e ON v.engine_id = e.id
      LEFT JOIN customer c ON c.cust_id = v.cust_id

      WHERE v.cust_id = ?
      ORDER BY m.name ASC
      `,
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
      `SELECT 
      v.*,
        m.id AS model_id,
        m.name AS model_name,
            e.id AS engine_id,
        e.name AS engine_name
      FROM vehicle v
       LEFT JOIN car_model m ON v.model_id = m.id 
       LEFT JOIN engine e ON v.engine_id = e.id
       WHERE cust_id = ?
       AND (model LIKE ? OR plate_number LIKE ?)  ORDER BY model ASC`,
      [cust_id, `%${query}%`, `%${query}%`]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/vehicles", async (req, res) => {
  const { cust_id, model_id, engine_id, year, gear, plate_number } = req.body;

  try {
    const [exist] = await db.query(
      `SELECT vehc_id FROM vehicle WHERE plate_number = ? `,
      [plate_number]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Plate number already exists" });
    }

    const [result] = await db.query(
      `INSERT INTO vehicle 
      (cust_id, model_id, engine_id, year, gear, plate_number)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [cust_id, model_id, engine_id, year, gear, plate_number]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 app.put("/vehicles/:id", async (req, res) => {
  const { id } = req.params;
  const { model_id, engine_id, year, gear, plate_number } = req.body;

  try {
    const [exist] = await db.query(
      `SELECT vehc_id FROM vehicle 
       WHERE plate_number = ? AND vehc_id != ?`,
      [plate_number, id]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Plate number already exists" });
    }

    await db.query(
      `UPDATE vehicle 
       SET model_id=?, engine_id=?, year=?, gear=?, plate_number=? 
       WHERE vehc_id=?`,
      [model_id, engine_id, year, gear, plate_number, id]
    );

    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET JOB CARDS
app.get("/jobcards", async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        jc.job_card_id,
        jc.status,
        jc.closed_at,
        jc.amount as total,
        m.name AS vehicle,
        CONCAT(c.first_name, ' ', c.last_name) AS customer
      FROM job_card jc
      LEFT JOIN vehicle v ON jc.vehc_id = v.vehc_id
      LEFT JOIN car_model m ON v.model_id = m.id
      LEFT JOIN customer c ON c.cust_id = v.cust_id
      WHERE jc.status != 'Cashed'
    `;

    const params = [];

    // SEARCH LOGIC
    if (search) {
      query += `
        AND (
          v.model LIKE ? OR
          CONCAT(c.first_name, ' ', c.last_name) LIKE ?
        )
      `;

      params.push(`${search}%`, `${search}%`);
    }

    query += " ORDER BY jc.opened_at DESC";

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// CREATE JOB CARD
app.post("/jobcards", async (req, res) => {
  try {
    const { vehicle_id, due_date, tasks = [] } = req.body;

    // 1. Get customer id
    const [custRows] = await db.query(
      `SELECT cust_id FROM vehicle WHERE vehc_id = ?`,
      [vehicle_id]
    );

    if (!custRows.length) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const cust_id = custRows[0].cust_id;

    // 2. Check duplicate job
    const [exist] = await db.query(
      `
      SELECT jc.*
      FROM job_card jc
      JOIN vehicle v ON jc.vehc_id = v.vehc_id
      JOIN customer c ON c.cust_id = v.cust_id
      WHERE jc.vehc_id = ? AND c.cust_id = ?
      `,
      [vehicle_id, cust_id]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        message: "Job card already exists for this vehicle"
      });
    }

    // 3. Insert job card
    const [result] = await db.query(
      `INSERT INTO job_card (vehc_id, status, closed_at, amount)
       VALUES (?, 'not_started', ?, 0)`,
      [vehicle_id, due_date]
    );

    const job_card_id = result.insertId;

    // 4. Insert tasks IF EXISTS
    let total = 0;

    if (tasks.length > 0) {
      for (const t of tasks) {
        await db.query(
          `INSERT INTO job_task 
          (job_card_id, fees, description, service, status, task_parts)
          VALUES (?, ?, ?, ?, 'not_started', ?)`,
          [
            job_card_id,
            t.fee || 0,
            t.description || "",
            t.service || null,
            t.parts || ""
          ]
        );

        total += Number(t.fee || 0);
      }

      // 5. update total amount
      await db.query(
        `UPDATE job_card SET amount = ? WHERE job_card_id = ?`,
        [total, job_card_id]
      );
    }

    // 6. return created job
    const [rows] = await db.query(
      `SELECT * FROM job_card WHERE job_card_id = ?`,
      [job_card_id]
    );

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
// UPDATE JOB CARD
app.put("/jobcards/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const result = await db.query(
      `UPDATE job_card 
       SET status=$1 
       WHERE id=$2 
       RETURNING *`,
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});
// GET TASKS
app.get("/jobtask/:id", async (req, res) => {
  const id = req.params.id;

  try {

    const [rows] = await db.query(
      `
  SELECT *
  FROM job_task
  JOIN services 
    ON job_task.service = services.code
  WHERE job_task.job_card_id = ?
  `,
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET JOB INFO
app.get("/jobcards/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [jobRows] = await db.query(`
      SELECT 
        jc.job_card_id,
        jc.status,
        jc.closed_at,
        jc.amount AS total,
        m.name as model,
        v.plate_number,
        v.year,
        e.name as engine,
        v.gear,
        c.first_name,
        c.last_name
      FROM job_card jc
      LEFT JOIN vehicle v ON jc.vehc_id = v.vehc_id
        LEFT JOIN car_model m ON v.model_id = m.id
          LEFT JOIN engine e ON v.engine_id = e.id
      LEFT JOIN customer c ON c.cust_id = v.cust_id
      WHERE jc.job_card_id = ?
    `, [id]);

    if (!jobRows.length) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = jobRows[0];

    res.json({
      ...job,
      customer_name: `${job.first_name || ""} ${job.last_name || ""}`.trim()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

app.get("/services", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT code, `desc` FROM services");
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.post("/tasks", async (req, res) => {
  try {
    const { job_card_id, description, fees, service, task_parts } = req.body;

    // 1. insert task
    const [result] = await db.query(
      `INSERT INTO job_task 
      (job_card_id, fees, description, service, status, task_parts)
      VALUES (?, ?, ?, ?, 'not_started', ?)`,
      [job_card_id, fees, description, service, task_parts]
    );
    // Optional: get total fees
    const [[totalResult]] = await db.query(
      `SELECT SUM(fees) AS total FROM job_task WHERE job_card_id = ?`,
      [job_card_id]
    );

    const total = totalResult.total || 0;
    await db.query(
      `UPDATE job_card SET amount = ? WHERE job_card_id = ?`,
      [total, job_card_id]
    );
    // 2. update job card status after insert


    res.json({ message: "Task created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
const updateJobStatus = async (job_card_id) => {
  // Get all task statuses
  const [tasks] = await db.query(
    `SELECT status FROM job_task WHERE job_card_id = ?`,
    [job_card_id]
  );

  if (tasks.length === 0) return;

  const statuses = tasks.map(t => t.status);

  let newStatus = "not_started";

  if (statuses.every(s => s === "completed")) {
    newStatus = "completed";
  }
   else if (statuses.some(s => s === "completed")) {
    newStatus = "in_progress";
  }
  else if (statuses.some(s => s === "in_progress")) {
    newStatus = "in_progress";
  }

  // Update job status
  await db.query(
    `UPDATE job_card SET status = ? WHERE job_card_id = ?`,
    [newStatus, job_card_id]
  );

 
  const [[totalResult]] = await db.query(
    `SELECT SUM(fees) AS total FROM job_task WHERE job_card_id = ?`,
    [job_card_id]
  );

  const total = totalResult.total || 0;
  await db.query(
    `UPDATE job_card SET amount = ? WHERE job_card_id = ?`,
    [total, job_card_id]
  );
  return { newStatus, total };
};
app.put("/tasks/:id", async (req, res) => {
  try {
    const {
      job_card_id,
      description,
      fees,
      service,
      status,
      task_parts
    } = req.body;

    await db.query(
      `
      UPDATE job_task
      SET 
        job_card_id = ?,
        description = ?,
        fees = ?,
        service = ?,
        status = ?,
        task_parts = ?
      WHERE task_id = ?
      `,
      [
        job_card_id,
        description,
        fees,
        service,
        status,
        task_parts,
        req.params.id
      ]
    );
    await updateJobStatus(job_card_id);
    res.json({ message: "Task updated successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
});
app.delete("/tasks/:id", async (req, res) => {
  try {

    // get task info first
    const [tasks] = await db.query(
      "SELECT job_card_id FROM job_task WHERE task_id = ?",
      [req.params.id]
    );

    if (!tasks.length) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    const job_card_id = tasks[0].job_card_id;

    // delete task
    await db.query(
      "DELETE FROM job_task WHERE task_id = ?",
      [req.params.id]
    );

    // recalculate total fees
    const [totalRows] = await db.query(
      `
      SELECT IFNULL(SUM(fees),0) AS total
      FROM job_task
      WHERE job_card_id = ?
      `,
      [job_card_id]
    );

    // update job card amount
    await db.query(
      `
      UPDATE job_card
      SET amount = ?
      WHERE job_card_id = ?
      `,
      [totalRows[0].total, job_card_id]
    );

    // update overall status
    await updateJobStatus(job_card_id);

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
app.delete("/jobcards/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [tasks] = await db.query(
      `SELECT status FROM job_task WHERE job_card_id = ?`,
      [id]
    );

    //  block delete if ANY task is not "not_started"
    const hasActiveTask = tasks.some(
      (t) => t.status !== "not_started"
    );

    if (hasActiveTask) {
      return res.status(400).json({
        message: "Cannot delete: job has active tasks"
      });
    }

    await db.query(
      `DELETE FROM job_card WHERE job_card_id = ?`,
      [id]
    );

    return res.json({ message: "Job card deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});



// ================= GET INVOICE =================
// returns job info + tasks (invoice data)
app.get("/invoices/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // ✅ JOB + VEHICLE + CUSTOMER
    const [jobRows] = await db.query(
      `
      SELECT 
        jc.job_card_id,
        jc.status,
        jc.amount AS total,

        m.model_nme as model,
        v.plate_number,
        v.year,

        CONCAT(c.first_name, ' ', c.last_name) AS customer_name

      FROM job_card jc
      JOIN vehicle v ON jc.vehc_id = v.vehc_id
        LEFT JOIN car_model m ON v.model_id = m.id
       
      JOIN customer c ON v.cust_id = c.cust_id
      WHERE jc.job_card_id = ?
      `,
      [id]
    );

    if (!jobRows.length) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // ✅ TASKS (MATCH FRONTEND)
    const [taskRows] = await db.query(
      `
      SELECT 
        task_id,
        description,
        service,
        fee
      FROM task
      WHERE job_card_id = ?
      `,
      [id]
    );

    //  FINAL RESPONSE (IMPORTANT STRUCTURE)
    res.json({
      job: jobRows[0],
      tasks: taskRows
    });

  } catch (err) {
    console.error("INVOICE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/getinvoices", async (req, res) => {
  try {
    const { status, date } = req.query;

    let query = `
      SELECT 
        jc.job_card_id,
        jc.status,
        jc.closed_at,
        jc.opened_at,
        jc.amount as total,
        m.name AS vehicle,
        CONCAT(c.first_name, ' ', c.last_name) AS customer
      FROM job_card jc
      LEFT JOIN vehicle v ON jc.vehc_id = v.vehc_id
        LEFT JOIN car_model m ON v.model_id = m.id
      
      LEFT JOIN customer c ON c.cust_id = v.cust_id
      WHERE 1=1
    `;

    const params = [];

    //  filter by status
    if (status) {
      query += " AND jc.status = ?";
      params.push(status);
    }

    //  filter by date (YYYY-MM-DD)
    if (date) {
      query += " AND DATE(jc.opened_at) = ?";
      params.push(date);
    }
    
    query += " ORDER BY jc.opened_at DESC";

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/invoices/:id/cashout", async (req, res) => {
  const id = req.params.id;
  try {


    const [rows] = await db.query(
      `UPDATE job_card SET status = 'Cashed' WHERE job_card_id = ?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/dashboard", async (req, res) => {
  try {
    const [sales] = await db.query(
      "SELECT IFNULL(SUM(amount),0) AS total FROM job_card"
    );

    const [cards] = await db.query(
      "SELECT COUNT(*) AS total FROM job_card"
    );

    const [stats] = await db.query(`
      SELECT status, COUNT(*) AS count 
      FROM job_card 
      GROUP BY status
    `);

    // HISTOGRAM DATA
    const [salesByDate] = await db.query(`
      SELECT 
        DATE(closed_at) AS date,
        SUM(amount) AS total
      FROM job_card
      WHERE amount IS NOT NULL
      and status='Cashed'
      GROUP BY DATE(closed_at)
      ORDER BY DATE(closed_at)
    `);

    res.json({
      totalSales: sales[0].total,
      totalCards: cards[0].total,
      statusStats: stats,
      salesByDate
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});
app.get("/models", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, code, name FROM car_model ORDER BY name ASC`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/engines", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, code, name FROM engine ORDER BY name ASC`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});











