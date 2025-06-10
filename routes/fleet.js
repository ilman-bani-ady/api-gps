const express = require('express');
const router = express.Router();
const pool = require('../db.config');

// Get all fleet
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                f.device_id,
                f.vehicle_name,
                f.plate_number,
                f.status,
                f.last_update,
                t.latitude as last_latitude,
                t.longitude as last_longitude,
                t.speed as last_speed
            FROM fleet f
            LEFT JOIN temp_data t ON f.device_id = t.device_id
            WHERE t.timestamp = (
                SELECT MAX(timestamp)
                FROM temp_data
                WHERE device_id = f.device_id
                AND valid = true
            )
            OR t.timestamp IS NULL
            ORDER BY f.device_id
        `;
        
        const result = await pool.query(query);
        
        res.json({
            status: 'success',
            data: result.rows,
            total: result.rowCount
        });
    } catch (error) {
        console.error('Error fetching fleet:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Get single fleet by device_id
router.get('/:device_id', async (req, res) => {
    try {
        const { device_id } = req.params;
        const query = `
            SELECT 
                f.device_id,
                f.vehicle_name,
                f.plate_number,
                f.status,
                f.last_update,
                t.latitude as last_latitude,
                t.longitude as last_longitude,
                t.speed as last_speed
            FROM fleet f
            LEFT JOIN temp_data t ON f.device_id = t.device_id
            WHERE f.device_id = $1
            AND (t.timestamp = (
                SELECT MAX(timestamp)
                FROM temp_data
                WHERE device_id = f.device_id
                AND valid = true
            )
            OR t.timestamp IS NULL)
        `;
        
        const result = await pool.query(query, [device_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Vehicle not found'
            });
        }

        res.json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Add new fleet
router.post('/', async (req, res) => {
    try {
        const { device_id, vehicle_name, plate_number } = req.body;

        // Validate input
        if (!device_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Device ID is required'
            });
        }

        // Check if device_id already exists
        const checkQuery = 'SELECT device_id FROM fleet WHERE device_id = $1';
        const checkResult = await pool.query(checkQuery, [device_id]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Device ID already exists'
            });
        }

        // Insert new fleet
        const query = `
            INSERT INTO fleet (device_id, vehicle_name, plate_number, status)
            VALUES ($1, $2, $3, 'active')
            RETURNING *
        `;
        
        const result = await pool.query(query, [device_id, vehicle_name, plate_number]);

        res.json({
            status: 'success',
            data: result.rows[0],
            message: 'Vehicle added successfully'
        });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Update fleet
router.put('/:device_id', async (req, res) => {
    try {
        const { device_id } = req.params;
        const { vehicle_name, plate_number, status } = req.body;

        // Check if device exists
        const checkQuery = 'SELECT device_id FROM fleet WHERE device_id = $1';
        const checkResult = await pool.query(checkQuery, [device_id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Vehicle not found'
            });
        }

        // Update fleet
        const query = `
            UPDATE fleet 
            SET 
                vehicle_name = COALESCE($2, vehicle_name),
                plate_number = COALESCE($3, plate_number),
                status = COALESCE($4, status),
                last_update = CURRENT_TIMESTAMP
            WHERE device_id = $1
            RETURNING *
        `;
        
        const result = await pool.query(query, [device_id, vehicle_name, plate_number, status]);

        res.json({
            status: 'success',
            data: result.rows[0],
            message: 'Vehicle updated successfully'
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

// Delete fleet
router.delete('/:device_id', async (req, res) => {
    try {
        const { device_id } = req.params;

        // Check if device exists
        const checkQuery = 'SELECT device_id FROM fleet WHERE device_id = $1';
        const checkResult = await pool.query(checkQuery, [device_id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Vehicle not found'
            });
        }

        // Delete fleet
        const query = 'DELETE FROM fleet WHERE device_id = $1 RETURNING device_id';
        const result = await pool.query(query, [device_id]);

        res.json({
            status: 'success',
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

module.exports = router;