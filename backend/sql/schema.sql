-- 1. Create the independent table 
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
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
  CONSTRAINT fk_user_team FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(100),
  maintenance_team_id INT NOT NULL,
  purchase_date DATE NULL,
  warranty_expiry DATE NULL,
  owner_name VARCHAR(100) NULL,
  is_scrapped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_equipment_team FOREIGN KEY (maintenance_team_id) REFERENCES teams(id)
);

CREATE TABLE maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  type ENUM('Corrective', 'Preventive') NOT NULL,
  status ENUM('New', 'In Progress', 'Repaired', 'Scrap') DEFAULT 'New',
  equipment_id INT NOT NULL,
  team_id INT NOT NULL,
  assigned_technician_id INT NULL,
  created_by INT NOT NULL,
  scheduled_date DATE NULL,
  duration_hours INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_request_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  CONSTRAINT fk_request_team FOREIGN KEY (team_id) REFERENCES teams(id),
  CONSTRAINT fk_request_technician FOREIGN KEY (assigned_technician_id) REFERENCES users(id),
  CONSTRAINT fk_request_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE request_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  old_status ENUM('New', 'In Progress', 'Repaired', 'Scrap') NOT NULL,
  new_status ENUM('New', 'In Progress', 'Repaired', 'Scrap') NOT NULL,
  changed_by INT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_log_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id),
  CONSTRAINT fk_log_user FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_request_logs_request ON request_logs(request_id);
CREATE INDEX idx_request_logs_user ON request_logs(changed_by);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_request_team ON maintenance_requests(team_id);
CREATE INDEX idx_request_status ON maintenance_requests(status);
CREATE INDEX idx_request_creator ON maintenance_requests(created_by);