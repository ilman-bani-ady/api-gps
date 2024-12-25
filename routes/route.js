const express = require('express');
const router = express.Router();
const pool = require('../db.config');

// Get all routes
router.get('/routes', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        rute_trip_id,
        halte_name,
        latitude,
        longitude,
        rute_sort
      FROM rute_trip
      ORDER BY rute_trip_id, rute_sort ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get route by rute_trip_id
router.get('/routes/:rute_trip_id', async (req, res) => {
  try {
    const { rute_trip_id } = req.params;
    const query = `
      SELECT 
        id,
        rute_trip_id,
        halte_name,
        latitude,
        longitude,
        rute_sort
      FROM rute_trip 
      WHERE rute_trip_id = $1
      ORDER BY rute_sort ASC
    `;
    
    const result = await pool.query(query, [rute_trip_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;