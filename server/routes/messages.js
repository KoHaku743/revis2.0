import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM messages WHERE to_user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { to_user_id, phone_id, message } = req.body;

  if (!to_user_id || !message) {
    return res.status(400).json({ error: 'to_user_id and message required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (from_user_id, to_user_id, phone_id, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, to_user_id, phone_id || null, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE messages SET read = true WHERE id = $1 AND to_user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
