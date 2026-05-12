const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// Change this if needed for your local setup
const SECRET = "your_jwt_secret_key";

// ================= DB =================
// Update these MySQL details to match your own local MySQL setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_mysql_password",
  database: "expense_tracker",
});

db.connect((err) => {
  if (err) {
    console.log("DB connection error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// ================= AUTH MIDDLEWARE =================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

// ================= ACTIVITY LOGGER =================
const logActivity = (user, action) => {
  db.query(
    "INSERT INTO user_activity (user_id, username, action) VALUES (?, ?, ?)",
    [user.id, user.username, action]
  );
};

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.json({ error: err });

      if (results.length === 0) {
        return res.json({ error: "User not found" });
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.json({ error: "Wrong password" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET
      );

      logActivity(user, "Logged in");

      res.json({ token });
    }
  );
});

// ================= GET EXPENSES =================
app.get("/expenses", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.json({ error: err });

      res.json(results);
    }
  );
});

// ================= ADD EXPENSE =================
app.post("/add-expense", authenticateToken, (req, res) => {
  const { name, amount, category, description, date } = req.body;

  db.query(
    "INSERT INTO expenses (name, amount, category, description, date, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    [name, amount, category, description, date, req.user.id],
    (err) => {
      if (err) return res.json({ error: err });

      logActivity(req.user, `Added expense: ${name}`);

      res.json({ message: "Expense added" });
    }
  );
});

// ================= UPDATE EXPENSE =================
app.put("/expenses/:id", authenticateToken, (req, res) => {
  const { name, amount, category, description, date } = req.body;

  db.query(
    "UPDATE expenses SET name = ?, amount = ?, category = ?, description = ?, date = ? WHERE id = ? AND user_id = ?",
    [name, amount, category, description, date, req.params.id, req.user.id],
    (err) => {
      if (err) return res.json({ error: err });

      logActivity(req.user, `Updated expense: ${name}`);

      res.json({ message: "Expense updated" });
    }
  );
});

// ================= DELETE EXPENSE =================
app.delete("/expenses/:id", authenticateToken, (req, res) => {
  const expenseId = req.params.id;

  db.query(
    "SELECT name FROM expenses WHERE id = ? AND user_id = ?",
    [expenseId, req.user.id],
    (selectErr, rows) => {
      if (selectErr) return res.json({ error: selectErr });

      const expenseName = rows.length > 0 ? rows[0].name : "Unknown expense";

      db.query(
        "DELETE FROM expenses WHERE id = ? AND user_id = ?",
        [expenseId, req.user.id],
        (deleteErr) => {
          if (deleteErr) return res.json({ error: deleteErr });

          logActivity(req.user, `Deleted expense: ${expenseName}`);

          res.json({ message: "Expense deleted" });
        }
      );
    }
  );
});

// ================= GET CATEGORIES =================
app.get("/categories", authenticateToken, (req, res) => {
  db.query("SELECT * FROM categories ORDER BY name ASC", (err, results) => {
    if (err) return res.json({ error: err });

    res.json(results);
  });
});

// ================= GET USER ACTIVITY =================
app.get("/activity", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.json({ error: err });

      res.json(results);
    }
  );
});

// ================= CLEAR ACTIVITY =================
app.post("/clear-activity", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM user_activity WHERE user_id = ?",
    [req.user.id],
    (err) => {
      if (err) return res.json({ error: err });

      res.json({ message: "Activity cleared" });
    }
  );
});

// ================= LOGOUT =================
app.post("/logout", authenticateToken, (req, res) => {
  logActivity(req.user, "Logged out");

  res.json({ message: "Logged out" });
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});