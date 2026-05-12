import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activity, setActivity] = useState([]);

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername || "User");
      fetchExpenses(savedToken);
      fetchCategories(savedToken);
      fetchActivity(savedToken);
    }
  }, []);

  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const categoryTotals = expenses.reduce((totals, expense) => {
    const cat = expense.category || "Uncategorised";
    const value = Number(expense.amount || 0);
    totals[cat] = (totals[cat] || 0) + value;
    return totals;
  }, {});

  const filteredExpenses = expenses.filter((expense) => {
    const searchText = search.toLowerCase();

    return (
      expense.name?.toLowerCase().includes(searchText) ||
      expense.category?.toLowerCase().includes(searchText) ||
      expense.description?.toLowerCase().includes(searchText)
    );
  });

  const normaliseCategory = (value) => {
    if (!value) return "";
    const cleaned = value.trim().toLowerCase();

    const matchedCategory = categories.find(
      (cat) => cat.name.trim().toLowerCase() === cleaned
    );

    return matchedCategory ? matchedCategory.name : value.trim();
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Please enter username and password");
      return;
    }

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);

      setToken(data.token);

      fetchExpenses(data.token);
      fetchCategories(data.token);
      fetchActivity(data.token);
    } else {
      alert(data.error || "Login failed");
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setToken("");
    setExpenses([]);
    setCategories([]);
    setActivity([]);
    setUsername("");
    setPassword("");
    clearForm();
  };

  const fetchExpenses = async (userToken) => {
    const res = await fetch("http://localhost:5000/expenses", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await res.json();
    setExpenses(Array.isArray(data) ? data : []);
  };

  const fetchCategories = async (userToken) => {
    const res = await fetch("http://localhost:5000/categories", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  const fetchActivity = async (userToken) => {
    const res = await fetch("http://localhost:5000/activity", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await res.json();
    setActivity(Array.isArray(data) ? data : []);
  };

 const handleClearActivity = () => {
  const confirmClear = window.confirm(
    "Are you sure you want to clear activity history?"
  );

  if (!confirmClear) return;

  setActivity([]);
};

  const clearForm = () => {
    setName("");
    setAmount("");
    setCategory("");
    setDescription("");
    setDate("");
    setEditingId(null);
  };

  const handleAddExpense = async () => {
    if (!name.trim() || !amount || !category || !date) {
      alert("Please fill all required fields properly");
      return;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const res = await fetch("http://localhost:5000/add-expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        amount,
        category,
        description,
        date,
      }),
    });

    const data = await res.json();

    if (data.message) {
      fetchExpenses(token);
      fetchActivity(token);
      clearForm();
    } else {
      alert("Failed to add expense");
    }
  };

  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setName(expense.name || "");
    setAmount(expense.amount || "");
    setCategory(normaliseCategory(expense.category));
    setDescription(expense.description || "");

    if (expense.date) {
      setDate(expense.date.slice(0, 10));
    }
  };

  const handleUpdateExpense = async () => {
    if (!name.trim() || !amount || !category || !date) {
      alert("Please fill all required fields properly");
      return;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const res = await fetch(`http://localhost:5000/expenses/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        amount,
        category,
        description,
        date,
      }),
    });

    const data = await res.json();

    if (data.message) {
      fetchExpenses(token);
      fetchActivity(token);
      clearForm();
    } else {
      alert("Failed to update expense");
    }
  };

  const handleDeleteExpense = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`http://localhost:5000/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.message) {
      fetchExpenses(token);
      fetchActivity(token);
    } else {
      alert("Failed to delete expense");
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-circle">ET</div>
          <h1>Expense Tracker</h1>
          <p className="subtitle">Securely manage your spending in one place.</p>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Expense Tracker</h2>
        <p>React • Express • MySQL • JWT</p>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <div className="top-section">
          <div>
            <h1>Dashboard</h1>
            <p>Logged in as {username || "User"}</p>
          </div>

          <div className="summary-card">
            <span>Total spent</span>
            <strong>${totalSpent.toFixed(2)}</strong>
          </div>
        </div>

        <section className="card">
          <h2>Category Breakdown</h2>

          {Object.keys(categoryTotals).length === 0 ? (
            <p className="empty-state">No category data yet.</p>
          ) : (
            <div className="category-grid">
              {Object.entries(categoryTotals).map(([cat, total]) => (
                <div className="category-card" key={cat}>
                  <span>{cat}</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>

          <div className="form-grid">
            <input
              placeholder="Expense name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            <input
              className="full-width"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-actions">
            {editingId ? (
              <>
                <button className="primary-btn" onClick={handleUpdateExpense}>
                  Update Expense
                </button>
                <button className="secondary-btn" onClick={clearForm}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="primary-btn" onClick={handleAddExpense}>
                Add Expense
              </button>
            )}
          </div>
        </section>

        <section className="card">
          <div className="expense-header">
            <h2>Expenses</h2>

            <input
              className="search-input"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredExpenses.length === 0 ? (
            <p className="empty-state">No matching expenses found.</p>
          ) : (
            <div className="table">
              <div className="table-header">
                <span>Name</span>
                <span>Amount</span>
                <span>Category</span>
                <span>Actions</span>
              </div>

              {filteredExpenses.map((e) => (
                <div className="table-row" key={e.id}>
                  <span>
                    <strong>{e.name}</strong>
                    <small>{e.description || "No description"}</small>
                  </span>
                  <span>${Number(e.amount).toFixed(2)}</span>
                  <span className="tag">{e.category}</span>
                  <span className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEditClick(e)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteExpense(e.id)}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="expense-header">
            <h2>User Activity</h2>

            <button className="delete-btn" onClick={handleClearActivity}>
              Clear Activity
            </button>
          </div>

          {activity.length === 0 ? (
            <p className="empty-state">No activity recorded yet.</p>
          ) : (
            <div className="activity-list">
              {activity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <strong>{item.action}</strong>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;