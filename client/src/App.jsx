import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

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

  const [adminUsers, setAdminUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserExpenses, setSelectedUserExpenses] = useState([]);
  const [selectedUserActivity, setSelectedUserActivity] = useState([]);

  const [adminEditUserId, setAdminEditUserId] = useState(null);
  const [adminEditUsername, setAdminEditUsername] = useState("");
  const [adminEditEmail, setAdminEditEmail] = useState("");
  const [adminEditRole, setAdminEditRole] = useState("user");

  const [adminExpenseEditId, setAdminExpenseEditId] = useState(null);
  const [adminExpenseName, setAdminExpenseName] = useState("");
  const [adminExpenseAmount, setAdminExpenseAmount] = useState("");
  const [adminExpenseCategory, setAdminExpenseCategory] = useState("");
  const [adminExpenseDescription, setAdminExpenseDescription] = useState("");
  const [adminExpenseDate, setAdminExpenseDate] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");

    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername || "User");
      setRole(savedRole || "user");

      if (savedRole === "admin") {
        fetchAdminUsers(savedToken);
      } else {
        fetchExpenses(savedToken);
        fetchCategories(savedToken);
        fetchActivity(savedToken);
      }
    }
  }, []);

  const getAuthHeaders = (userToken = token) => ({
    Authorization: `Bearer ${userToken}`,
  });

  const getJsonAuthHeaders = (userToken = token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`,
  });

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
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          username: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        setToken(data.token);
        setUsername(data.username);
        setRole(data.role);

        if (data.role === "admin") {
          fetchAdminUsers(data.token);
        } else {
          fetchExpenses(data.token);
          fetchCategories(data.token);
          fetchActivity(data.token);
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("Could not connect to backend. Make sure node index.js is running.");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error(error);
    }

    localStorage.clear();

    setToken("");
    setUsername("");
    setRole("");
    setEmail("");
    setPassword("");
    setExpenses([]);
    setCategories([]);
    setActivity([]);
    setAdminUsers([]);
    setSelectedUser(null);
    clearForm();
  };

  const fetchExpenses = async (userToken) => {
    const res = await fetch(`${API_URL}/expenses`, {
      headers: getAuthHeaders(userToken),
    });

    const data = await res.json();
    setExpenses(Array.isArray(data) ? data : []);
  };

  const fetchCategories = async (userToken) => {
    const res = await fetch(`${API_URL}/categories`, {
      headers: getAuthHeaders(userToken),
    });

    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  const fetchActivity = async (userToken) => {
    const res = await fetch(`${API_URL}/activity`, {
      headers: getAuthHeaders(userToken),
    });

    const data = await res.json();
    setActivity(Array.isArray(data) ? data : []);
  };

  const handleClearActivity = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear activity history?"
    );

    if (!confirmClear) return;

    const res = await fetch(`${API_URL}/clear-activity`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (data.message) {
      fetchActivity(token);
    } else {
      alert("Failed to clear activity");
    }
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

    const res = await fetch(`${API_URL}/add-expense`, {
      method: "POST",
      headers: getJsonAuthHeaders(),
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

    const res = await fetch(`${API_URL}/expenses/${editingId}`, {
      method: "PUT",
      headers: getJsonAuthHeaders(),
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

    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (data.message) {
      fetchExpenses(token);
      fetchActivity(token);
    } else {
      alert("Failed to delete expense");
    }
  };

  const fetchAdminUsers = async (userToken) => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeaders(userToken),
    });

    const data = await res.json();
    setAdminUsers(Array.isArray(data) ? data : []);
  };

  const fetchAdminUserDetails = async (id) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (data.user) {
      setSelectedUser(data.user);
      setSelectedUserExpenses(Array.isArray(data.expenses) ? data.expenses : []);
      setSelectedUserActivity(Array.isArray(data.activity) ? data.activity : []);

      setAdminEditUserId(data.user.id);
      setAdminEditUsername(data.user.username || "");
      setAdminEditEmail(data.user.email || "");
      setAdminEditRole(data.user.role || "user");
    } else {
      alert(data.error || "Failed to load user details");
    }
  };

  const handleAdminUpdateUser = async () => {
    if (!adminEditUsername.trim() || !adminEditEmail.trim() || !adminEditRole) {
      alert("Please fill all user fields");
      return;
    }

    const res = await fetch(`${API_URL}/admin/users/${adminEditUserId}`, {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        username: adminEditUsername,
        email: adminEditEmail,
        role: adminEditRole,
      }),
    });

    const data = await res.json();

    if (data.message) {
      fetchAdminUsers(token);
      fetchAdminUserDetails(adminEditUserId);
      alert("User updated");
    } else {
      alert(data.error || "Failed to update user");
    }
  };

  const handleAdminDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (data.message) {
      setSelectedUser(null);
      setSelectedUserExpenses([]);
      setSelectedUserActivity([]);
      fetchAdminUsers(token);
    } else {
      alert(data.error || "Failed to delete user");
    }
  };

  const handleAdminExpenseEditClick = (expense) => {
    setAdminExpenseEditId(expense.id);
    setAdminExpenseName(expense.name || "");
    setAdminExpenseAmount(expense.amount || "");
    setAdminExpenseCategory(expense.category || "");
    setAdminExpenseDescription(expense.description || "");
    setAdminExpenseDate(expense.date ? expense.date.slice(0, 10) : "");
  };

  const clearAdminExpenseForm = () => {
    setAdminExpenseEditId(null);
    setAdminExpenseName("");
    setAdminExpenseAmount("");
    setAdminExpenseCategory("");
    setAdminExpenseDescription("");
    setAdminExpenseDate("");
  };

  const handleAdminUpdateExpense = async () => {
    if (!selectedUser || !adminExpenseEditId) return;

    const res = await fetch(
      `${API_URL}/admin/users/${selectedUser.id}/expenses/${adminExpenseEditId}`,
      {
        method: "PUT",
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          name: adminExpenseName,
          amount: adminExpenseAmount,
          category: adminExpenseCategory,
          description: adminExpenseDescription,
          date: adminExpenseDate,
        }),
      }
    );

    const data = await res.json();

    if (data.message) {
      fetchAdminUserDetails(selectedUser.id);
      clearAdminExpenseForm();
    } else {
      alert(data.error || "Failed to update expense");
    }
  };

  const handleAdminDeleteExpense = async (expenseId) => {
    if (!selectedUser) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user's expense?"
    );

    if (!confirmDelete) return;

    const res = await fetch(
      `${API_URL}/admin/users/${selectedUser.id}/expenses/${expenseId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json();

    if (data.message) {
      fetchAdminUserDetails(selectedUser.id);
    } else {
      alert(data.error || "Failed to delete expense");
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-circle">ET</div>
          <h1>Expense Tracker</h1>
          <p className="subtitle">Login as an admin or user.</p>

          <input
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

  if (role === "admin") {
    return (
      <div className="dashboard">
        <aside className="sidebar">
          <h2>Admin Dashboard</h2>
          <p>Logged in as {username}</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="main-content">
          <div className="top-section">
            <div>
              <h1>Admin Panel</h1>
              <p>View users, activity timestamps, and manage user records.</p>
            </div>

            <div className="summary-card">
              <span>Total users</span>
              <strong>{adminUsers.length}</strong>
            </div>
          </div>

          <section className="card">
            <h2>Users and Activity</h2>

            {adminUsers.length === 0 ? (
              <p className="empty-state">No users found.</p>
            ) : (
              <div className="table admin-table">
                <div className="table-header">
                  <span>User</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Last Activity</span>
                  <span>Actions</span>
                </div>

                {adminUsers.map((user) => (
                  <div className="table-row" key={user.id}>
                    <span>
                      <strong>{user.username}</strong>
                      <small>ID: {user.id}</small>
                    </span>
                    <span>{user.email}</span>
                    <span className="tag">{user.role}</span>
                    <span>
                      {user.last_activity
                        ? new Date(user.last_activity).toLocaleString()
                        : "No activity"}
                    </span>
                    <span className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => fetchAdminUserDetails(user.id)}
                      >
                        View
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleAdminDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {selectedUser && (
            <>
              <section className="card">
                <h2>Selected User Details</h2>

                <div className="form-grid">
                  <input
                    placeholder="Username"
                    value={adminEditUsername}
                    onChange={(e) => setAdminEditUsername(e.target.value)}
                  />

                  <input
                    placeholder="Email"
                    value={adminEditEmail}
                    onChange={(e) => setAdminEditEmail(e.target.value)}
                  />

                  <select
                    value={adminEditRole}
                    onChange={(e) => setAdminEditRole(e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button className="primary-btn" onClick={handleAdminUpdateUser}>
                    Update User
                  </button>
                </div>
              </section>

              <section className="card">
                <h2>{selectedUser.username}'s Expenses</h2>

                {adminExpenseEditId && (
                  <div className="form-grid">
                    <input
                      placeholder="Expense name"
                      value={adminExpenseName}
                      onChange={(e) => setAdminExpenseName(e.target.value)}
                    />

                    <input
                      type="number"
                      placeholder="Amount"
                      value={adminExpenseAmount}
                      onChange={(e) => setAdminExpenseAmount(e.target.value)}
                    />

                    <input
                      placeholder="Category"
                      value={adminExpenseCategory}
                      onChange={(e) => setAdminExpenseCategory(e.target.value)}
                    />

                    <input
                      type="date"
                      value={adminExpenseDate}
                      onChange={(e) => setAdminExpenseDate(e.target.value)}
                    />

                    <input
                      className="full-width"
                      placeholder="Description"
                      value={adminExpenseDescription}
                      onChange={(e) => setAdminExpenseDescription(e.target.value)}
                    />

                    <div className="form-actions full-width">
                      <button
                        className="primary-btn"
                        onClick={handleAdminUpdateExpense}
                      >
                        Update Expense
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={clearAdminExpenseForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {selectedUserExpenses.length === 0 ? (
                  <p className="empty-state">This user has no expenses.</p>
                ) : (
                  <div className="table">
                    <div className="table-header">
                      <span>Name</span>
                      <span>Amount</span>
                      <span>Category</span>
                      <span>Actions</span>
                    </div>

                    {selectedUserExpenses.map((expense) => (
                      <div className="table-row" key={expense.id}>
                        <span>
                          <strong>{expense.name}</strong>
                          <small>{expense.description || "No description"}</small>
                        </span>
                        <span>${Number(expense.amount).toFixed(2)}</span>
                        <span className="tag">{expense.category}</span>
                        <span className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleAdminExpenseEditClick(expense)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleAdminDeleteExpense(expense.id)
                            }
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
                <h2>{selectedUser.username}'s Activity</h2>

                {selectedUserActivity.length === 0 ? (
                  <p className="empty-state">No activity recorded.</p>
                ) : (
                  <div className="activity-list">
                    {selectedUserActivity.map((item) => (
                      <div className="activity-item" key={item.id}>
                        <strong>{item.action}</strong>
                        <small>{new Date(item.created_at).toLocaleString()}</small>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Expense Tracker</h2>
        <p>User Dashboard</p>
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

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

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