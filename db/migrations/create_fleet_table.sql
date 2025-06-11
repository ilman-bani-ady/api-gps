CREATE TABLE IF NOT EXISTS fleet (
    device_id VARCHAR(50) PRIMARY KEY,
    vehicle_name VARCHAR(100) NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50),
    capacity INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    last_maintenance DATE,
    next_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_fleet_device_id ON fleet(device_id);
CREATE INDEX IF NOT EXISTS idx_fleet_status ON fleet(status);
CREATE INDEX IF NOT EXISTS idx_fleet_plate_number ON fleet(plate_number);