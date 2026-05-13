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

-- Password for both accounts is: 123456
INSERT INTO users (username, email, password, role) VALUES
('Admin', 'admin@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'admin'),
('Belal', 'belal@test.com', '$2b$10$2qxIYHNw0vZCPvf9ZfOpUuOMVXP2P7s38bsQ0ZmWr5uyV.eE16Poy', 'user');

INSERT INTO expenses (name, amount, category, description, date, user_id) VALUES
('Lunch', 18.50, 'Food', 'Lunch at university', '2026-05-10', 2),
('Train fare', 7.20, 'Transport', 'Travel to campus', '2026-05-11', 2),
('Phone bill', 65.00, 'Bills', 'Monthly phone bill', '2026-05-12', 2);

INSERT INTO user_activity (user_id, username, action) VALUES
(2, 'Belal', 'Added expense: Lunch'),
(2, 'Belal', 'Added expense: Train fare'),
(2, 'Belal', 'Added expense: Phone bill');