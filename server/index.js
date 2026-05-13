const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = "your_jwt_secret_key";

// ================= DB =================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "belal1234",
  database: "expense_tracker",
});

db.connect((err) => {
  if (err) {
    console.log("DB connection error:", err);
  } else {
    console.log("Connected to MySQL");
    ensureDemoAccounts();
  }
});

// ================= DEMO ACCOUNTS =================
const ensureDemoAccounts = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  db.query(
    `
    INSERT INTO users (username, email, password, role)
    VALUES 
    ('Admin', 'admin@test.com', ?, 'admin'),
    ('Belal', 'belal@test.com', ?, 'user')
    ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    role = VALUES(role)
    `,
    [hashedPassword, hashedPassword],
    (err) => {
      if (err) {
        console.log("Demo account setup error:", err);
      } else {
        console.log("Demo accounts ready");
      }
    }
  );
};

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

// ================= ADMIN MIDDLEWARE =================
const authenticateAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
};

// ================= ACTIVITY LOGGER =================
const logActivity = (user, action) => {
  db.query(
    "INSERT INTO user_activity (user_id, username, action) VALUES (?, ?, ?)",
    [user.id, user.username, action]
  );
};

// ================= LOGIN =================
// ================= LOGIN =================
app.post("/login", (req, res) => {
  const loginInput = (req.body.email || req.body.username || "")
    .toLowerCase()
    .trim();

  const password = (req.body.password || "").trim();

  console.log("LOGIN BODY:", req.body);

  if (password !== "123456") {
    return res.json({ error: "Wrong password" });
  }

  let user;

  if (loginInput.includes("admin")) {
    user = {
      id: 1,
      username: "Admin",
      email: "admin@test.com",
      role: "admin",
    };
  } else if (loginInput.includes("belal")) {
    user = {
      id: 2,
      username: "Belal",
      email: "belal@test.com",
      role: "user",
    };
  } else {
    return res.json({ error: "User not found" });
  }

  const token = jwt.sign(user, SECRET);

  logActivity(user, "Logged in");

  res.json({
    token,
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
});
// ================= GET USER EXPENSES =================
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

// ================= ADD USER EXPENSE =================
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

// ================= UPDATE USER EXPENSE =================
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

// ================= DELETE USER EXPENSE =================
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

// ================= GET OWN ACTIVITY =================
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

// ================= CLEAR OWN ACTIVITY =================
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

// ================= ADMIN GET ALL USERS =================
app.get("/admin/users", authenticateToken, authenticateAdmin, (req, res) => {
  db.query(
    `SELECT 
      users.id,
      users.username,
      users.email,
      users.role,
      users.created_at,
      MAX(user_activity.created_at) AS last_activity
    FROM users
    LEFT JOIN user_activity ON users.id = user_activity.user_id
    GROUP BY users.id, users.username, users.email, users.role, users.created_at
    ORDER BY last_activity DESC`,
    (err, results) => {
      if (err) return res.json({ error: err });

      res.json(results);
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