
const mysql = require("mysql");
const cors = require("cors");
const admin = require("firebase-admin");
const express = require("express");
require("dotenv").config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix for multiline keys
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();

const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "https://singular-sherbet-a50cac.netlify.app/",
];

app.use(
cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman) or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,PATCH,DELETE", // Explicitly allowed methods
  credentials: true, // Enable cookies and credentials
})
);

// Google Cloud MySQL Database Connection
const sqlDb = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

sqlDb.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1); // Exit the process if the database connection fails
  } else {
    console.log("Connected to the Google Cloud MySQL database.");
  }
});



// Fetch Tasks
app.get("/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks";
  sqlDb.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    return res.json(result);
  });
});

app.post("/tasks", (req, res) => {
  // Create the timestamp without the 'Z' at the end
  const createdAt = new Date().toISOString().slice(0, 19).replace("T", " "); // '2025-01-26 18:49:58'

  const sql = "INSERT INTO tasks (`name`, `status`, `created_at`) VALUES (?, ?, ?)";
  const values = [req.body.task, req.body.status, createdAt];

  sqlDb.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to insert task" });
    }

    const taskId = result.insertId;
    // Write to Firebase
    const fbResp = db.ref(`tasks/${taskId}`).set({
      id: taskId,
      name: req.body.task,
      status: req.body.status,
      createdAt: createdAt,
    });

    console.log(fbResp);

    return res.json({ message: "Task added successfully", id: taskId });
  });
});


// Update Task
app.put("/tasks/:id", (req, res) => {
  const sql = "UPDATE tasks SET status = ? WHERE id = ?";
  const values = [req.body.status, req.params.id];

  sqlDb.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update status" });
    }

    // Update Firebase
    db.ref(`tasks/${req.params.id}`).update({ status: req.body.status });

    return res.json({ message: "Task status updated successfully" });
  });
});

// Delete Task
app.delete("/tasks/:id", (req, res) => {
  const sql = "DELETE FROM tasks WHERE id = ?";
  const values = [req.params.id];

  sqlDb.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete task" });
    }

    // Remove from Firebase
    db.ref(`tasks/${req.params.id}`).remove();

    return res.json({ message: "Task deleted successfully" });
  });
});

// Start Server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
