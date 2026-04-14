import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const assigned = req.query.assigned_to === 'me' ? req.user.id : null;

    let query = 'SELECT * FROM phones';
    const params = [];

    if (assigned) {
      query += ' WHERE assigned_to = $1';
      params.push(assigned);
    }

    query += ' ORDER BY updated_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { serial_number, model } = req.body;

  if (!serial_number || !model) {
    return res.status(400).json({ error: 'Serial number and model required' });
  }

  try {
    const serial_prefix = serial_number.match(/^([A-Z]+)/)?.[1] || 'UNKNOWN';

    const result = await pool.query(
      'INSERT INTO phones (serial_number, serial_prefix, model, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
      [serial_number, serial_prefix, model, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM phones WHERE id = $1', [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phone not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  const { status, assigned_to } = req.body;

  try {
    const fields = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      fields.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (assigned_to !== undefined) {
      fields.push(`assigned_to = $${paramCount++}`);
      params.push(assigned_to);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    params.push(req.params.id);

    const query = `UPDATE phones SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phone not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM phones WHERE id = $1 RETURNING *', [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phone not found' });
    }

    res.json({ message: 'Phone deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
