# SQL Queries for Slotly Parking Management System

This document contains all the SQL queries used to create the database schema for the Slotly Parking Management System.

## Database Schema

### Parking Lots Table

This table stores information about each parking lot in the system.

\`\`\`sql
CREATE TABLE IF NOT EXISTS parking_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  total_spaces INT NOT NULL,
  hourly_rate DECIMAL(5, 2),
  daily_rate DECIMAL(5, 2),
  is_covered BOOLEAN DEFAULT false,
  has_ev_charging BOOLEAN DEFAULT false,
  has_handicap_spaces BOOLEAN DEFAULT false,
  operating_hours VARCHAR(50) DEFAULT '24/7',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Sensors Table

This table stores information about IoT sensors installed in parking spaces.

\`\`\`sql
CREATE TABLE IF NOT EXISTS sensors (
  id VARCHAR(20) PRIMARY KEY,
  type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  battery_level INT,
  last_maintenance_date DATE,
  installation_date DATE DEFAULT CURRENT_DATE,
  firmware_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Parking Spaces Table

This table stores information about individual parking spaces within each parking lot.

\`\`\`sql
CREATE TABLE IF NOT EXISTS parking_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE,
  space_number VARCHAR(10) NOT NULL,
  space_type VARCHAR(50) NOT NULL DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'available',
  sensor_id VARCHAR(20) REFERENCES sensors(id) ON DELETE SET NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_space_number_per_lot UNIQUE (lot_id, space_number)
);
\`\`\`

### Users Table

This table stores information about users of the system, including both administrators and customers.

\`\`\`sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(15),
  membership_type VARCHAR(50) DEFAULT 'regular',
  registration_date DATE DEFAULT CURRENT_DATE,
  license_plate VARCHAR(15),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Parking Sessions Table

This table tracks each parking session, including check-in and check-out times, fees, and vehicle information.

\`\`\`sql
CREATE TABLE IF NOT EXISTS parking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parking_space_id UUID REFERENCES parking_spaces(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_cost DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'pending',
  vehicle_license_plate VARCHAR(15),
  vehicle_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Revenue Reports Table

This table stores daily revenue reports for each parking lot.

\`\`\`sql
CREATE TABLE IF NOT EXISTS revenue_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  daily_revenue DECIMAL(10, 2),
  occupied_spaces_percentage DECIMAL(5, 2),
  peak_hour VARCHAR(50),
  total_sessions INT,
  avg_session_duration INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_report_per_day_per_lot UNIQUE (lot_id, report_date)
);
\`\`\`

### Maintenance Logs Table

This table tracks maintenance activities for parking lots.

\`\`\`sql
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID REFERENCES parking_lots(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(100) NOT NULL,
  description TEXT,
  performed_by VARCHAR(100),
  maintenance_date DATE NOT NULL,
  cost DECIMAL(10, 2),
  next_scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Indexes

The following indexes were created to improve query performance:

\`\`\`sql
CREATE INDEX IF NOT EXISTS idx_parking_spaces_lot_id ON parking_spaces(lot_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_status ON parking_spaces(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_user_id ON parking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_space_id ON parking_sessions(parking_space_id);
CREATE INDEX IF NOT EXISTS idx_revenue_reports_date ON revenue_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_lot_id ON maintenance_logs(lot_id);
\`\`\`

## Relationships

- **Parking Lots** → **Parking Spaces**: One-to-many relationship. A parking lot contains many parking spaces.
- **Sensors** → **Parking Spaces**: One-to-one relationship. A sensor is installed in a single parking space.
- **Users** → **Parking Sessions**: One-to-many relationship. A user can have multiple parking sessions.
- **Parking Spaces** → **Parking Sessions**: One-to-many relationship. A parking space can have multiple parking sessions over time.
- **Parking Lots** → **Revenue Reports**: One-to-many relationship. A parking lot has many daily revenue reports.
- **Parking Lots** → **Maintenance Logs**: One-to-many relationship. A parking lot has many maintenance logs.

## Notes

- The `ON DELETE CASCADE` constraint ensures that when a parking lot is deleted, all related parking spaces, revenue reports, and maintenance logs are also deleted.
- The `ON DELETE SET NULL` constraint for the `sensor_id` in the `parking_spaces` table allows a sensor to be removed without affecting the parking space.
- The `unique_space_number_per_lot` constraint ensures that space numbers are unique within each parking lot.
- The `unique_report_per_day_per_lot` constraint ensures that there is only one revenue report per day for each parking lot.
