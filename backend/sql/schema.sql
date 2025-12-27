-- 1. Create the independent table 
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- 2. Create the dependent table with newly added foreign key
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('manager', 'technician', 'user') NOT NULL,
  team_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Foreign Key added here
  CONSTRAINT fk_user_team FOREIGN KEY (team_id) REFERENCES teams(id)
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
