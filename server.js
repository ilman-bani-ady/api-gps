const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./db.config');
const userRoutes = require('./routes/user');
const trackingRoutes = require('./routes/tracking');
const routeRoutes = require('./routes/route');
const authRoutes = require('./routes/auth');
const fleetRoutes = require('./routes/fleet');

const app = express();
const port = process.env.PORT || 3013;

// CORS config agar cookie bisa dikirim dari frontend
app.use(cors({
  origin: 'http://localhost:3000', // GANTI sesuai alamat frontend Anda
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// API endpoint untuk mendapatkan semua rute
app.get('/api/routes', async (req, res) => {
  try {
    const query = 'SELECT * FROM rute_trip_copy1 ORDER BY rute_trip_id, rute_sort';
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
    const query = 'SELECT * FROM rute_trip_copy1 WHERE rute_trip_id = $1 ORDER BY rute_sort';
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
app.use('/api/user', userRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api', routeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/fleet', fleetRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});