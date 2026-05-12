# Expense Tracker A2

## Overview

Expense Tracker A2 is a full-stack web application built using **React (frontend)**, **Node.js + Express (backend)**, **MySQL (database)**, and **JWT authentication**.

The application allows users to securely manage their personal expenses with full CRUD functionality, real-time search, category-based insights, and user activity tracking.

---

## Features

* User authentication (Login with JWT)
* Password hashing using bcrypt
* Add new expenses
* View all expenses
* Edit existing expenses
* Delete expenses
* Live search (real-time filtering of expenses)
* Category dropdown (loaded from database)
* Category spending breakdown (total per category)
* User activity logs (login, add, update, delete, logout)
* Form validation and error handling
* Modern responsive dashboard UI

---

## Technology Stack

### Frontend

* React (Vite)
* JavaScript (useState, useEffect)
* CSS (custom styling)

### Backend

* Node.js
* Express.js
* jsonwebtoken (JWT authentication)
* bcrypt (password hashing)
* mysql2 (database connection)
* cors

### Database

* MySQL

### Tables

* **users** → stores user accounts
* **expenses** → stores expense records
* **categories** → stores expense categories
* **user_activity** → stores user actions and logs

---

## Project Structure

expense-tracker-advanced/
├── client/ → React frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── assets/
│   ├── index.html
│   └── package.json

├── server/ → Express backend
│   ├── index.js
│   └── package.json

├── ExpenseTracker.sql → Database schema
└── README.md

---

## How to Run the Application

### 1. Setup Database

Open MySQL Workbench and run the provided ExpenseTracker.sql file.

This will automatically create:
- expense_tracker database
- users table
- expenses table
- categories table
- user_activity table

### 2. Start Backend
Before running the backend, update the MySQL password inside server/index.js with your local MySQL password.

And then run: 
cd server
npm install
node index.js

Server runs on:
http://localhost:5000

### 3. Start Frontend

cd client
npm install
npm run dev

Frontend runs on:
http://localhost:5173

## 4. Demo Login
Username: Belal
Password: 123456
---

## API Endpoints

### Authentication

* POST /login
* POST /logout

### Expenses

* GET /expenses
* POST /add-expense
* PUT /expenses/:id
* DELETE /expenses/:id

### Categories

* GET /categories

### User Activity

* GET /activity

---

## Security

* Passwords are hashed using bcrypt before storing
* JWT tokens are used for authentication
* Protected routes require a valid token
* Authorization header format:
  Authorization: Bearer <token>

---

## Business Logic

The application allows users to:

* Categorise expenses
* Monitor total spending
* View category-based summaries
* Search expenses instantly
* Track all actions through activity logs

---

## CRUD Functionality

* **Create** → Add new expense
* **Read** → View all expenses
* **Update** → Edit expense
* **Delete** → Remove expense

---

## Extra Features

* Live search filtering
* Category breakdown dashboard
* User activity tracking system
* Responsive UI design
* Input validation for forms
* Error handling for API requests

---

## Notes

* This is a **Single Page Application (SPA)**
* All operations happen without page reload
* Data is dynamically updated from the backend
* Activity logs track all major user actions

---

## Author

Belal Omar (Solo Assignment)
