CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('manager', 'technician', 'user') NOT NULL,
  team_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(100),
  maintenance_team_id INT NOT NULL,
  is_scrapped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (maintenance_team_id) REFERENCES teams(id)
);

CREATE TABLE maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  type ENUM('Corrective', 'Preventive') NOT NULL,
  status ENUM('New', 'In Progress', 'Repaired', 'Scrap') DEFAULT 'New',
  equipment_id INT NOT NULL,
  team_id INT NOT NULL,
  assigned_technician_id INT NULL,
  scheduled_date DATE NULL,
  duration_hours INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (assigned_technician_id) REFERENCES users(id)
);
