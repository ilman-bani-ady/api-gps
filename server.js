const express = require('express');
const cors = require('cors');
const pool = require('./db.config');
const userRoutes = require('./routes/user');
const trackingRoutes = require('./routes/tracking');
const routeRoutes = require('./routes/route');

const app = express();
const port = process.env.PORT || 3013;

app.use(cors());
app.use(express.json());

// API endpoint untuk mendapatkan semua rute
app.get('/api/routes', async (req, res) => {
  try {
    const query = 'SELECT * FROM rute_trip ORDER BY rute_trip_id, rute_sort';
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

// API endpoint untuk mendapatkan rute berdasarkan rute_trip_id
app.get('/api/routes/:rute_trip_id', async (req, res) => {
  try {
    const { rute_trip_id } = req.params;
    const query = 'SELECT * FROM rute_trip WHERE rute_trip_id = $1 ORDER BY rute_sort';
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

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api', routeRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});