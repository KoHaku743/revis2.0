import express from 'express';
import pool from '../db.js';
import bcryptjs from 'bcryptjs';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, username, role, employee_code, created_at FROM users ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { name, username, password, employee_code, role } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, username, and password required' });
  }

  try {
    const passwordHash = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, username, password_hash, employee_code, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, role, employee_code',
      [name, username, passwordHash, employee_code || null, role || 'technician']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  const { name, employee_code, role } = req.body;

  try {
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (name) {
      fields.push(`name = $${paramCount++}`);
      params.push(name);
    }

    if (employee_code) {
      fields.push(`employee_code = $${paramCount++}`);
      params.push(employee_code);
    }

    if (role) {
      fields.push(`role = $${paramCount++}`);
      params.push(role);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, username, role, employee_code`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
