# Expense Tracker Advanced

## Overview

Expense Tracker Advanced is a full-stack web application developed using:

- React (Frontend)
- Node.js + Express (Backend)
- MySQL (Database)
- JWT Authentication

The application implements a role-based authentication system where users and admins have different dashboards and permissions.

---

## Features

### Authentication

- Secure login using JWT
- Password hashing using bcrypt
- Role-based authentication
- Email and password login system

---

## User Dashboard Features

Normal users can:

- Add expenses
- View expenses
- Edit expenses
- Delete expenses
- Search expenses in real time
- View category spending breakdown
- View personal activity history

---

## Admin Dashboard Features

Admins can:

- View all registered users
- View user activity timestamps
- Open individual user profiles
- View user expenses
- Edit user details
- Delete users
- Edit user expenses
- Delete user expenses

---

## Technology Stack

### Frontend

- React (Vite)
- JavaScript
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- mysql2
- cors
- dotenv

### Database

- MySQL

---

## Database Tables

### users

Stores:
- username
- email
- hashed password
- role (admin or user)

### expenses

Stores user expense records.

### categories

Stores predefined expense categories.

### user_activity

Stores user actions and timestamps.

---

## Project Structure

expense-tracker-advanced/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── assets/
│   ├── package.json
│   └── index.html
│
├── server/
│   ├── index.js
│   ├── .env
│   └── package.json
│
├── ExpenseTracker.sql
└── README.md

---

## How to Run the Application

### 1. Setup Database

Open MySQL Workbench.

Open and run:

ExpenseTracker.sql

This will automatically create:

- expense_tracker database
- users table
- expenses table
- categories table
- user_activity table

It will also insert:

- demo admin account
- demo user accounts
- sample expense data
- sample activity logs

---

### 2. Configure Environment Variables

Inside the server folder, create a file called:

.env

Paste this inside:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=expense_tracker
JWT_SECRET=expense_tracker_secret_key

Replace:

YOUR_MYSQL_PASSWORD

with your actual MySQL password.

---

### 3. Start Backend

Open a terminal:

cd server
npm install
npm install dotenv
node index.js

Backend runs on:

http://localhost:5000

---

### 4. Start Frontend

Open another terminal:

cd client
npm install
npm run dev

Frontend runs on:

http://localhost:5173

---

## Demo Accounts

### Admin Account

Email: admin@test.com
Password: 123456

---

### User Accounts

belal@test.com
sarah@test.com
ahmed@test.com
mia@test.com
james@test.com
aisha@test.com
daniel@test.com
layla@test.com
omar@test.com

Password for all users:

123456