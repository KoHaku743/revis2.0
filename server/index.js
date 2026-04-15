const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')
const db = require('./db')

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const tajnyKluc = process.env.JWT_SECRET || 'vyvojovy_kluc'

app.use(cors())
app.use(express.json())

const vseobecnyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Príliš veľa požiadaviek. Skúste to prosím neskôr.' },
})

const prihlasovaciLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Príliš veľa pokusov o prihlásenie. Skúste to prosím neskôr.' },
})

app.use('/api', vseobecnyLimiter)
app.use('/api/auth/login', prihlasovaciLimiter)

// Serial number must start with a known prefix followed by 1–50 digits.
// Using a bounded quantifier (\d{1,50}) avoids potential ReDoS with long digit strings.
const serialRegex = /^(VYK|REF|KEO|KET|BAC|BAE|BAI|BAO|BAU|BAV|BBE|MTT|NRM|PDK|POE|PPF|TNL|TTA|ZAA|ZAM|CZ)\d{1,50}$/

const overToken = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Chýba token.' })
  }

  try {
    req.user = jwt.verify(token, tajnyKluc)
    return next()
  } catch {
    return res.status(401).json({ message: 'Neplatný token.' })
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username])
  const user = rows[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Neplatné prihlasovacie údaje.' })
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, tajnyKluc, { expiresIn: '8h' })
  return res.json({ token, user: { id: user.id, name: user.name, role: user.role } })
})

app.get('/api/auth/me', overToken, (req, res) => {
  res.json(req.user)
})

// ── Phones ────────────────────────────────────────────────────────────────────

app.get('/api/phones', overToken, async (req, res) => {
  let query = `
    SELECT p.*, u.name AS assigned_name
    FROM phones p
    LEFT JOIN users u ON u.id = p.assigned_to
  `
  const params = []

  if (req.query.assigned_to === 'me') {
    query += ' WHERE p.assigned_to = $1'
    params.push(req.user.id)
  }

  query += ' ORDER BY p.updated_at DESC'
  const { rows } = await db.query(query, params)
  return res.json(rows)
})

app.post('/api/phones', overToken, async (req, res) => {
  const { serial_number, model } = req.body
  const jeValidne = serialRegex.test(serial_number)
  const prefix = serial_number ? serial_number.replace(/\d+$/, '') : null

  const { rows } = await db.query(
    `INSERT INTO phones (serial_number, serial_prefix, model, status, assigned_to)
     VALUES ($1, $2, $3, 'in_progress', $4)
     RETURNING *`,
    [serial_number, prefix, model || 'Neznámy model', req.user.id],
  )

  const telefon = rows[0]
  telefon.assigned_name = req.user.name
  if (!jeValidne) {
    telefon.warning = 'Neznámy formát sériového čísla.'
  }

  return res.status(201).json(telefon)
})

app.get('/api/phones/:id', overToken, async (req, res) => {
  const { rows } = await db.query(
    `SELECT p.*, u.name AS assigned_name
     FROM phones p
     LEFT JOIN users u ON u.id = p.assigned_to
     WHERE p.id = $1`,
    [req.params.id],
  )

  if (!rows[0]) {
    return res.status(404).json({ message: 'Telefón neexistuje.' })
  }
  return res.json(rows[0])
})

app.patch('/api/phones/:id', overToken, async (req, res) => {
  const { status, assigned_to, model } = req.body

  const sets = []
  const params = []
  let idx = 1

  if (status) { sets.push(`status = $${idx++}`); params.push(status) }
  if (assigned_to) { sets.push(`assigned_to = $${idx++}`); params.push(assigned_to) }
  if (model !== undefined) { sets.push(`model = $${idx++}`); params.push(model) }

  if (sets.length === 0) {
    return res.status(400).json({ message: 'Žiadne polia na aktualizáciu.' })
  }

  sets.push(`updated_at = NOW()`)
  params.push(req.params.id)

  const { rows } = await db.query(
    `UPDATE phones SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    params,
  )

  if (!rows[0]) {
    return res.status(404).json({ message: 'Telefón neexistuje.' })
  }

  const userRow = await db.query('SELECT name FROM users WHERE id = $1', [rows[0].assigned_to])
  rows[0].assigned_name = userRow.rows[0]?.name || null
  return res.json(rows[0])
})

app.delete('/api/phones/:id', overToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin môže mazať telefóny.' })
  }

  const { rowCount } = await db.query('DELETE FROM phones WHERE id = $1', [req.params.id])
  if (rowCount === 0) {
    return res.status(404).json({ message: 'Telefón neexistuje.' })
  }
  return res.status(204).send()
})

// ── Repairs ───────────────────────────────────────────────────────────────────

app.get('/api/phones/:id/repairs', overToken, async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM repair_entries WHERE phone_id = $1 ORDER BY created_at DESC',
    [req.params.id],
  )
  res.json(rows)
})

app.post('/api/phones/:id/repairs', overToken, async (req, res) => {
  const { date, parts_used, description, service_type, test, button_action, sync } = req.body

  // Button 1 = 5 Nh (basic repair), 2 = 10 Nh (display), 3 = 15 Nh (housing), 4 = 15 Nh (full refurb)
  const nhMap = { 1: 5, 2: 10, 3: 15, 4: 15 }
  const normo_hours = nhMap[button_action] || null

  const { rows } = await db.query(
    `INSERT INTO repair_entries
       (phone_id, assigned_to, repair_date, parts_used, description, service_type,
        test_ok, test_nok, button_action, normo_hours, synced_to_sheet)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      req.params.id, req.user.id, date || new Date().toISOString().slice(0, 10),
      parts_used, description, service_type,
      test === 'OK', test === 'NOK',
      button_action || null, normo_hours, Boolean(sync),
    ],
  )

  await db.query('UPDATE phones SET updated_at = NOW() WHERE id = $1', [req.params.id])
  return res.status(201).json(rows[0])
})

app.patch('/api/repairs/:id', overToken, async (req, res) => {
  const { parts_used, description, service_type, test, button_action, synced_to_sheet } = req.body

  const sets = []
  const params = []
  let idx = 1

  if (parts_used !== undefined) { sets.push(`parts_used = $${idx++}`); params.push(parts_used) }
  if (description !== undefined) { sets.push(`description = $${idx++}`); params.push(description) }
  if (service_type !== undefined) { sets.push(`service_type = $${idx++}`); params.push(service_type) }
  if (test !== undefined) {
    sets.push(`test_ok = $${idx++}`); params.push(test === 'OK')
    sets.push(`test_nok = $${idx++}`); params.push(test === 'NOK')
  }
  if (button_action !== undefined) { sets.push(`button_action = $${idx++}`); params.push(button_action) }
  if (synced_to_sheet !== undefined) { sets.push(`synced_to_sheet = $${idx++}`); params.push(synced_to_sheet) }

  if (sets.length === 0) {
    return res.status(400).json({ message: 'Žiadne polia na aktualizáciu.' })
  }

  params.push(req.params.id)
  const { rows } = await db.query(
    `UPDATE repair_entries SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    params,
  )

  if (!rows[0]) {
    return res.status(404).json({ message: 'Záznam opravy neexistuje.' })
  }
  return res.json(rows[0])
})

app.delete('/api/repairs/:id', overToken, async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM repair_entries WHERE id = $1', [req.params.id])
  if (rowCount === 0) {
    return res.status(404).json({ message: 'Záznam opravy neexistuje.' })
  }
  return res.status(204).send()
})

app.post('/api/repairs/:id/sync', overToken, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM repair_entries WHERE id = $1', [req.params.id])
  const oprava = rows[0]

  if (!oprava) {
    return res.status(404).json({ message: 'Záznam opravy neexistuje.' })
  }

  if (!oprava.button_action || (!oprava.test_ok && !oprava.test_nok)) {
    return res.status(400).json({ message: 'Pred synchronizáciou nastavte test a tlačidlo 1-4.' })
  }

  await db.query(
    'UPDATE repair_entries SET synced_to_sheet = TRUE, synced_at = NOW() WHERE id = $1',
    [req.params.id],
  )
  return res.json({ success: true, message: 'Záznam bol označený ako synchronizovaný.' })
})

// ── Messages ──────────────────────────────────────────────────────────────────

app.get('/api/messages', overToken, async (req, res) => {
  const { rows } = await db.query(
    `SELECT m.*, u.name AS from_name
     FROM messages m
     JOIN users u ON u.id = m.from_user_id
     WHERE m.to_user_id = $1 OR m.from_user_id = $1
     ORDER BY m.created_at DESC`,
    [req.user.id],
  )
  res.json(rows)
})

app.post('/api/messages', overToken, async (req, res) => {
  const { to_user_id, phone_id, message } = req.body

  const { rows } = await db.query(
    `INSERT INTO messages (from_user_id, to_user_id, phone_id, message)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [req.user.id, to_user_id, phone_id || null, message],
  )

  rows[0].from_name = req.user.name
  return res.status(201).json(rows[0])
})

app.patch('/api/messages/:id/read', overToken, async (req, res) => {
  const { rows } = await db.query(
    'UPDATE messages SET read = TRUE WHERE id = $1 RETURNING *',
    [req.params.id],
  )

  if (!rows[0]) {
    return res.status(404).json({ message: 'Správa neexistuje.' })
  }
  return res.json(rows[0])
})

// ── Users ─────────────────────────────────────────────────────────────────────

app.get('/api/users', overToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin má prístup.' })
  }

  const { rows } = await db.query(
    'SELECT id, name, username, employee_code, role, created_at FROM users ORDER BY id',
  )
  res.json(rows)
})

app.post('/api/users', overToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin má prístup.' })
  }

  const { name, username, password, role, employee_code } = req.body

  if (!password) {
    return res.status(400).json({ message: 'Heslo je povinné.' })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { rows } = await db.query(
    `INSERT INTO users (name, username, password_hash, role, employee_code)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, name, username, employee_code, role, created_at`,
    [name, username, password_hash, role || 'technician', employee_code || null],
  )
  res.status(201).json(rows[0])
})

app.patch('/api/users/:id', overToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin má prístup.' })
  }

  const { name, username, password, role, employee_code } = req.body

  const sets = []
  const params = []
  let idx = 1

  if (name !== undefined) { sets.push(`name = $${idx++}`); params.push(name) }
  if (username !== undefined) { sets.push(`username = $${idx++}`); params.push(username) }
  if (role !== undefined) { sets.push(`role = $${idx++}`); params.push(role) }
  if (employee_code !== undefined) { sets.push(`employee_code = $${idx++}`); params.push(employee_code) }
  if (password) {
    const password_hash = await bcrypt.hash(password, 10)
    sets.push(`password_hash = $${idx++}`)
    params.push(password_hash)
  }

  if (sets.length === 0) {
    return res.status(400).json({ message: 'Žiadne polia na aktualizáciu.' })
  }

  params.push(req.params.id)
  const { rows } = await db.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}
     RETURNING id, name, username, employee_code, role, created_at`,
    params,
  )

  if (!rows[0]) {
    return res.status(404).json({ message: 'Používateľ neexistuje.' })
  }
  res.json(rows[0])
})

app.delete('/api/users/:id', overToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin má prístup.' })
  }

  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'Nemôžete zmazať vlastný účet.' })
  }

  const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [req.params.id])
  if (rowCount === 0) {
    return res.status(404).json({ message: 'Používateľ neexistuje.' })
  }
  return res.status(204).send()
})

// ── Stats ─────────────────────────────────────────────────────────────────────

app.get('/api/stats/monthly', overToken, async (_req, res) => {
  const { rows } = await db.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'completed') AS dokoncenych,
      COUNT(*) FILTER (WHERE status = 'testing') AS testovanie,
      COUNT(*) FILTER (WHERE status = 'in_progress') AS v_procese
    FROM phones
  `)
  const stat = rows[0]
  res.json({
    dokoncenych: Number(stat.dokoncenych),
    testovanie: Number(stat.testovanie),
    v_procese: Number(stat.v_procese),
  })
})

// ── Startup ───────────────────────────────────────────────────────────────────

async function seedDefaultUsers() {
  const { rows } = await db.query('SELECT id FROM users LIMIT 1')
  if (rows.length > 0) return

  const adminHash = await bcrypt.hash('admin123', 10)
  const technikHash = await bcrypt.hash('heslo123', 10)

  await db.query(
    `INSERT INTO users (name, username, password_hash, role, employee_code) VALUES
     ('Admin', 'admin', $1, 'admin', 'BAC'),
     ('Technik', 'technik', $2, 'technician', 'KEO')`,
    [adminHash, technikHash],
  )
  // eslint-disable-next-line no-console
  console.log('Vytvorení predvolení používatelia: admin / admin123, technik / heslo123')
}

async function start() {
  let attempts = 0
  while (attempts < 10) {
    try {
      await db.query('SELECT 1')
      break
    } catch {
      attempts++
      // eslint-disable-next-line no-console
      console.log(`Čakám na databázu... pokus ${attempts}/10`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  await seedDefaultUsers()

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server beží na porte ${port}`)
  })
}

start()
