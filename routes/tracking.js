const express = require('express');
const router = express.Router();
const pool = require('../db.config');

// Get all vehicle locations
router.get('/locations', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id,
        t.device_id,
        t.latitude,
        t.longitude,
        t.speed,
        t.course,
        t.date,
        t.timestamp,
        t.valid
      FROM temp_data t
      WHERE t.valid = true
      ORDER BY t.timestamp DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get location by device_id
router.get('/locations/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const query = `
      SELECT 
        t.id,
        t.device_id,
        t.latitude,
        t.longitude,
        t.speed,
        t.course,
        t.date,
        t.timestamp,
        t.valid
      FROM temp_data t
      WHERE t.device_id = $1 AND t.valid = true
      ORDER BY t.timestamp DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [device_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Device location not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching device location:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get last locations for multiple devices
router.post('/locations/bulk', async (req, res) => {
  try {
    const { device_ids } = req.body;

    if (!Array.isArray(device_ids)) {
      return res.status(400).json({
        status: 'error',
        message: 'device_ids must be an array'
      });
    }

    const query = `
      SELECT DISTINCT ON (t.device_id)
        t.id,
        t.device_id,
        t.latitude,
        t.longitude,
        t.speed,
        t.course,
        t.date,
        t.timestamp,
        t.valid
      FROM temp_data t
      WHERE t.device_id = ANY($1) AND t.valid = true
      ORDER BY t.device_id, t.timestamp DESC
    `;
    
    const result = await pool.query(query, [device_ids]);

    res.json({
      status: 'success',
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching bulk locations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get vehicle history
router.get('/history/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const { start_date, end_date } = req.query;

    // Validasi parameter
    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date and end_date are required'
      });
    }

    const query = `
      SELECT 
        id,
        device_id,
        latitude,
        longitude,
        speed,
        course,
        date,
        timestamp,
        valid
      FROM temp_data 
      WHERE device_id = $1 
        AND timestamp BETWEEN $2 AND $3
        AND valid = true
      ORDER BY timestamp ASC
    `;

    const result = await pool.query(query, [device_id, start_date, end_date]);

    res.json({
      status: 'success',
      data: {
        device_id,
        start_date,
        end_date,
        total_points: result.rowCount,
        track_points: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get summary history (dengan informasi tambahan)
router.get('/history-summary/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date and end_date are required'
      });
    }

    const query = `
      WITH track_data AS (
        SELECT 
          device_id,
          latitude,
          longitude,
          speed,
          timestamp,
          valid
        FROM temp_data 
        WHERE device_id = $1 
          AND timestamp BETWEEN $2 AND $3
          AND valid = true
        ORDER BY timestamp ASC
      )
      SELECT 
        device_id,
        COUNT(*) as total_points,
        MIN(timestamp) as start_time,
        MAX(timestamp) as end_time,
        COALESCE(AVG(NULLIF(speed, 0)), 0) as avg_speed,
        MAX(speed) as max_speed
      FROM track_data
      GROUP BY device_id
    `;

    const result = await pool.query(query, [device_id, start_date, end_date]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No history data found for this period'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching history summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;