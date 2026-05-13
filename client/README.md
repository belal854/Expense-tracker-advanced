# Expense Tracker Advanced

## Overview

Expense Tracker Advanced is a full-stack web application developed using:

- React (Frontend)
- Node.js + Express (Backend)
- MySQL (Database)
- JWT Authentication

The application implements a role-based authentication system where users and admins have different dashboards and permissions.

---

# Features

## Authentication

- Secure login using JWT
- Password hashing using bcrypt
- Role-based authentication
- Email and password login system

---

# User Dashboard Features

Normal users can:

- Add expenses
- View expenses
- Edit expenses
- Delete expenses
- Search expenses in real time
- View category spending breakdown
- View personal activity history

---

# Admin Dashboard Features

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

# Technology Stack

## Frontend

- React (Vite)
- JavaScript
- CSS

## Backend

- Node.js
- Express.js
- JWT
- bcrypt
- mysql2
- cors

## Database

- MySQL

---

# Database Tables

## users
Stores:
- username
- email
- hashed password
- role (admin or user)

## expenses
Stores user expense records.

## categories
Stores predefined expense categories.

## user_activity
Stores user actions and timestamps.

---

# Project Structure

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
│   └── package.json
│
├── ExpenseTracker.sql
└── README.md

# How to Run the Application

## 1. Setup Database

Open MySQL Workbench.

Run the provided:

ExpenseTracker.sql

This automatically creates:

expense_tracker database
users table
expenses table
categories table
user_activity table

It also inserts:

sample admin account
sample user account
sample expense data

## 2. Start Backend
cd server
npm install
node index.js

Before running:
update the MySQL password inside:
server/index.js

Server runs on:
http://localhost:5000

## 3. Start Frontend

Open another terminal:
cd client
npm install
npm run dev

Frontend runs on:
http://localhost:5173


## Demo Accounts