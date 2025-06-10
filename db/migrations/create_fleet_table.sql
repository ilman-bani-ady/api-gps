CREATE TABLE IF NOT EXISTS fleet (
    device_id VARCHAR(50) PRIMARY KEY,
    vehicle_name VARCHAR(100),
    plate_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_fleet_device_id ON fleet(device_id);
CREATE INDEX IF NOT EXISTS idx_fleet_status ON fleet(status);