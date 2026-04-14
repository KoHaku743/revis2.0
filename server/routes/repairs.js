import express from 'express';
import pool from '../db.js';
import { appendRepairToSheet } from '../services/googleSheets.js';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM repair_entries WHERE phone_id = $1 ORDER BY repair_date DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { repair_date, parts_used, description, service_type, test_ok, test_nok, button_action, service_price, is_refurb } = req.body;

  if (button_action === undefined || ![1, 2, 3, 4].includes(button_action)) {
    return res.status(400).json({ error: 'Valid button_action (1-4) required' });
  }

  try {
    const phoneResult = await pool.query('SELECT * FROM phones WHERE id = $1', [req.params.id]);
    if (phoneResult.rows.length === 0) {
      return res.status(404).json({ error: 'Phone not found' });
    }

    const normo_hours = { 1: 5, 2: 10, 3: 15, 4: 15 }[button_action];

    const result = await pool.query(
      `INSERT INTO repair_entries 
        (phone_id, assigned_to, repair_date, parts_used, description, service_type, test_ok, test_nok, button_action, service_price, normo_hours, is_refurb)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [req.params.id, req.user.id, repair_date || new Date(), parts_used, description, service_type, test_ok || false, test_nok || false, button_action, service_price, normo_hours, is_refurb || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:repair_id/sync', async (req, res) => {
  try {
    const repairResult = await pool.query('SELECT * FROM repair_entries WHERE id = $1', [
      req.params.repair_id,
    ]);

    if (repairResult.rows.length === 0) {
      return res.status(404).json({ error: 'Repair entry not found' });
    }

    const repair = repairResult.rows[0];

    const phoneResult = await pool.query('SELECT * FROM phones WHERE id = $1', [repair.phone_id]);
    const phone = phoneResult.rows[0];

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [repair.assigned_to]);
    const user = userResult.rows[0];

    const success = await appendRepairToSheet(repair, phone, user);

    if (success) {
      await pool.query(
        'UPDATE repair_entries SET synced_to_sheet = true, synced_at = NOW() WHERE id = $1',
        [repair.id]
      );

      res.json({ message: 'Repair synced to sheet', repair });
    } else {
      res.status(500).json({ error: 'Failed to sync to sheet' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
