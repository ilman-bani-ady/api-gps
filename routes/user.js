const express = require('express');
const router = express.Router();
const pool = require('../db.config');
const bcrypt = require('bcrypt');

// Get all users
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT id, username, full_name, role, created_at, last_login FROM users';
    const result = await pool.query(query);
    
    res.json({
      status: 'success',
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT id, username, full_name, role, created_at, last_login FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;

    // Validate required fields
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Check if username already exists
    const checkUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, password, full_name, role, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, username, full_name, role, created_at
    `;
    const values = [username, hashedPassword, full_name, role];
    const result = await pool.query(query, values);

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, password } = req.body;

    let query, values;
    
    if (password) {
      // If password is being updated
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE users 
        SET full_name = $1, role = $2, password = $3
        WHERE id = $4
        RETURNING id, username, full_name, role, created_at
      `;
      values = [full_name, role, hashedPassword, id];
    } else {
      // If password is not being updated
      query = `
        UPDATE users 
        SET full_name = $1, role = $2
        WHERE id = $3
        RETURNING id, username, full_name, role, created_at
      `;
      values = [full_name, role, id];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;