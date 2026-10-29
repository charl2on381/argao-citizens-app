CREATE DATABASE IF NOT EXISTS argao_registry;
USE argao_registry;

-- Users table (includes admins via is_admin flag)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_type ENUM('citizen','pwd','senior','non_citizen','admin') NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  -- Type-specific fields
  disability_id VARCHAR(50) NULL,      -- PWD
  senior_id VARCHAR(50) NULL,           -- Senior
  passport_no VARCHAR(50) NULL,         -- Non-citizen
  nationality VARCHAR(80) NULL,         -- Non-citizen
  -- Workflow
  status ENUM('pending','active','rejected') DEFAULT 'pending',
  is_admin BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL
);

-- Services offered by the Municipality of Argao
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  target_audience VARCHAR(100) DEFAULT 'all', -- all, citizen, pwd, senior, non_citizen
  office VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed services
INSERT INTO services (name, description, target_audience, office) VALUES
('Business Permit Registration', 'Apply for new or renewal of business permits.', 'all', 'Business Permits Office'),
('PWD ID Application', 'Apply for a Person with Disability ID.', 'pwd', 'MSWDO'),
('Senior Citizen ID', 'Application for Senior Citizen ID and benefits.', 'senior', 'OSCA'),
('Health Certificate', 'Obtain a municipal health certificate.', 'all', 'Rural Health Unit'),
('Civil Registry Documents', 'Birth, marriage, and death certificate requests.', 'citizen', 'Civil Registrar'),
('Barangay Clearance', 'Request barangay clearance.', 'citizen', 'Barangay Hall'),
('Employment Assistance', 'PESO job matching and referrals.', 'all', 'PESO Office'),
('Alien Registration Assistance', 'Assistance for foreign residents.', 'non_citizen', 'Mayor\'s Office');

-- Seed an admin (password: Admin123!)
-- Hash generated with bcrypt cost 10
INSERT INTO users (user_type, first_name, last_name, email, password_hash, status, is_admin)
VALUES ('admin', 'System', 'Admin', 'admin@argao.gov.ph',
'$2b$10$8K1p/a0dL1LXMIgoEDFrwOfgqwGZlH0xKWMBW.7WqKqY8g0C7pYyO',
'active', TRUE);