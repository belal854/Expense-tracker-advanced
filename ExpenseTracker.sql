DROP DATABASE IF EXISTS expense_tracker;
CREATE DATABASE expense_tracker;
USE expense_tracker;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  description VARCHAR(255),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
);

CREATE TABLE user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  username VARCHAR(255),
  action VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
);

INSERT INTO categories (name) VALUES
('Food'),
('Transport'),
('Shopping'),
('Bills'),
('Entertainment'),
('Health'),
('Other');

-- Password for all demo accounts is: 123456
INSERT INTO users (username, email, password, role) VALUES
('Admin', 'admin@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'admin'),
('Belal', 'belal@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('Sarah', 'sarah@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('Ahmed', 'ahmed@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('Mia', 'mia@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('James', 'james@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('Aisha', 'aisha@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('Daniel', 'daniel@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('Layla', 'layla@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user'),
('Omar', 'omar@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user');

INSERT INTO expenses (name, amount, category, description, date, user_id) VALUES
('Lunch', 18.50, 'Food', 'Lunch at university', '2026-05-10', 2),
('Train fare', 7.20, 'Transport', 'Travel to campus', '2026-05-11', 2),
('Phone bill', 65.00, 'Bills', 'Monthly phone bill', '2026-05-12', 2),

('Groceries', 45.30, 'Food', 'Weekly grocery shop', '2026-05-09', 3),
('Bus fare', 4.50, 'Transport', 'Bus to work', '2026-05-10', 3),

('Gym membership', 39.99, 'Health', 'Monthly gym payment', '2026-05-08', 4),
('Movie ticket', 22.00, 'Entertainment', 'Cinema night', '2026-05-11', 4),

('New shoes', 120.00, 'Shopping', 'Running shoes', '2026-05-07', 5),
('Dinner', 34.80, 'Food', 'Dinner with friends', '2026-05-12', 5),

('Electricity bill', 95.00, 'Bills', 'Monthly electricity bill', '2026-05-06', 6),
('Uber ride', 18.75, 'Transport', 'Ride home', '2026-05-09', 6),

('Pharmacy', 26.40, 'Health', 'Medicine purchase', '2026-05-10', 7),
('Concert ticket', 85.00, 'Entertainment', 'Music event', '2026-05-13', 7),

('Coffee', 6.50, 'Food', 'Morning coffee', '2026-05-11', 8),
('Clothes', 75.00, 'Shopping', 'New hoodie', '2026-05-12', 8),

('Internet bill', 69.00, 'Bills', 'Monthly internet bill', '2026-05-09', 9),
('Taxi', 28.00, 'Transport', 'Taxi to appointment', '2026-05-10', 9),

('Takeaway', 21.90, 'Food', 'Takeaway dinner', '2026-05-11', 10),
('Headphones', 110.00, 'Shopping', 'Wireless headphones', '2026-05-12', 10);

INSERT INTO user_activity (user_id, username, action) VALUES
(2, 'Belal', 'Logged in'),
(2, 'Belal', 'Added expense: Lunch'),
(2, 'Belal', 'Added expense: Train fare'),
(2, 'Belal', 'Added expense: Phone bill'),

(3, 'Sarah', 'Logged in'),
(3, 'Sarah', 'Added expense: Groceries'),
(3, 'Sarah', 'Added expense: Bus fare'),

(4, 'Ahmed', 'Logged in'),
(4, 'Ahmed', 'Added expense: Gym membership'),
(4, 'Ahmed', 'Added expense: Movie ticket'),

(5, 'Mia', 'Logged in'),
(5, 'Mia', 'Added expense: New shoes'),
(5, 'Mia', 'Added expense: Dinner'),

(6, 'James', 'Logged in'),
(6, 'James', 'Added expense: Electricity bill'),
(6, 'James', 'Added expense: Uber ride'),

(7, 'Aisha', 'Logged in'),
(7, 'Aisha', 'Added expense: Pharmacy'),
(7, 'Aisha', 'Added expense: Concert ticket'),

(8, 'Daniel', 'Logged in'),
(8, 'Daniel', 'Added expense: Coffee'),
(8, 'Daniel', 'Added expense: Clothes'),

(9, 'Layla', 'Logged in'),
(9, 'Layla', 'Added expense: Internet bill'),
(9, 'Layla', 'Added expense: Taxi'),

(10, 'Omar', 'Logged in'),
(10, 'Omar', 'Added expense: Takeaway'),
(10, 'Omar', 'Added expense: Headphones');