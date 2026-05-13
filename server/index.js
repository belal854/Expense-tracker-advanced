require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET;

// ================= DB =================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
app.post("/login", (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = (req.body.password || "").trim();

  if (!email || !password) {
    return res.json({ error: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE LOWER(email) = ?", [email], async (err, results) => {
    if (err) return res.json({ error: "Database error" });

    if (results.length === 0) {
      return res.json({ error: "User not found" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      SECRET
    );

    logActivity(user, "Logged in");

    res.json({
      token,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
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

// ================= ADMIN GET SINGLE USER DETAILS =================
app.get("/admin/users/:id", authenticateToken, authenticateAdmin, (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
    [userId],
    (err, userResults) => {
      if (err) return res.json({ error: err });

      if (userResults.length === 0) {
        return res.json({ error: "User not found" });
      }

      db.query(
        "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC",
        [userId],
        (expenseErr, expenseResults) => {
          if (expenseErr) return res.json({ error: expenseErr });

          db.query(
            "SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC",
            [userId],
            (activityErr, activityResults) => {
              if (activityErr) return res.json({ error: activityErr });

              res.json({
                user: userResults[0],
                expenses: expenseResults,
                activity: activityResults,
              });
            }
          );
        }
      );
    }
  );
});

// ================= ADMIN UPDATE USER =================
app.put("/admin/users/:id", authenticateToken, authenticateAdmin, (req, res) => {
  const { username, email, role } = req.body;

  db.query(
    "UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?",
    [username, email, role, req.params.id],
    (err) => {
      if (err) return res.json({ error: err });

      logActivity(req.user, `Admin updated user: ${username}`);
      res.json({ message: "User updated" });
    }
  );
});

// ================= ADMIN DELETE USER =================
app.delete("/admin/users/:id", authenticateToken, authenticateAdmin, (req, res) => {
  const userId = Number(req.params.id);

  if (userId === req.user.id) {
    return res.json({ error: "Admin cannot delete their own account" });
  }

  db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
    if (err) return res.json({ error: err });

    logActivity(req.user, `Admin deleted user ID: ${userId}`);
    res.json({ message: "User deleted" });
  });
});

// ================= ADMIN UPDATE USER EXPENSE =================
app.put(
  "/admin/users/:userId/expenses/:expenseId",
  authenticateToken,
  authenticateAdmin,
  (req, res) => {
    const { name, amount, category, description, date } = req.body;

    db.query(
      "UPDATE expenses SET name = ?, amount = ?, category = ?, description = ?, date = ? WHERE id = ? AND user_id = ?",
      [name, amount, category, description, date, req.params.expenseId, req.params.userId],
      (err) => {
        if (err) return res.json({ error: err });

        logActivity(req.user, `Admin updated expense ID: ${req.params.expenseId}`);
        res.json({ message: "User expense updated" });
      }
    );
  }
);

// ================= ADMIN DELETE USER EXPENSE =================
app.delete(
  "/admin/users/:userId/expenses/:expenseId",
  authenticateToken,
  authenticateAdmin,
  (req, res) => {
    db.query(
      "DELETE FROM expenses WHERE id = ? AND user_id = ?",
      [req.params.expenseId, req.params.userId],
      (err) => {
        if (err) return res.json({ error: err });

        logActivity(req.user, `Admin deleted expense ID: ${req.params.expenseId}`);
        res.json({ message: "User expense deleted" });
      }
    );
  }
);

// ================= LOGOUT =================
app.post("/logout", authenticateToken, (req, res) => {
  logActivity(req.user, "Logged out");
  res.json({ message: "Logged out" });
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});