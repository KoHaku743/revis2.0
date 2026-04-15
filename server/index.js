const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')

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

const users = [
  { id: 1, name: 'Admin', username: 'admin', password: 'admin123', role: 'admin', employee_code: 'BAC' },
  { id: 2, name: 'Technik', username: 'technik', password: 'heslo123', role: 'technician', employee_code: 'KEO' },
]

const telefony = [
  { id: 1, serial_number: 'VYK261701003', model: 'iPhone 15 Pro', status: 'in_progress', assigned_to: 2, assigned_name: 'Technik' },
  { id: 2, serial_number: 'REF252800242', model: 'iPhone 13 Mini', status: 'testing', assigned_to: 2, assigned_name: 'Technik' },
]

const opravy = [
  { id: 1, phone_id: 1, repair_date: '2026-04-14', description: 'Výmena batérie', button_action: 1, test_ok: true, test_nok: false },
]

const spravy = [
  { id: 1, from_user_id: 1, to_user_id: 2, from_name: 'Admin', phone_id: 1, message: 'Prosím doplniť test displeja.', read: false },
]

const serialRegex = /^(VYK|REF|KEO|KET|BAC|BAE|BAI|BAO|BAU|BAV|BBE|MTT|NRM|PDK|POE|PPF|TNL|TTA|ZAA|ZAM|CZ)\d+$/

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

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find((item) => item.username === username && item.password === password)

  if (!user) {
    return res.status(401).json({ message: 'Neplatné prihlasovacie údaje.' })
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, tajnyKluc, { expiresIn: '8h' })
  return res.json({ token, user: { id: user.id, name: user.name, role: user.role } })
})

app.get('/api/auth/me', overToken, (req, res) => {
  res.json(req.user)
})

app.get('/api/phones', overToken, (req, res) => {
  if (req.query.assigned_to === 'me') {
    return res.json(telefony.filter((telefon) => telefon.assigned_to === req.user.id))
  }
  return res.json(telefony)
})

app.post('/api/phones', overToken, (req, res) => {
  const { serial_number, model } = req.body
  const jeValidne = serialRegex.test(serial_number)
  const novyTelefon = {
    id: telefony.length + 1,
    serial_number,
    model: model || 'Neznámy model',
    status: 'in_progress',
    assigned_to: req.user.id,
    assigned_name: req.user.name,
    warning: jeValidne ? null : 'Neznámy formát sériového čísla.',
  }
  telefony.push(novyTelefon)
  return res.status(201).json(novyTelefon)
})

app.get('/api/phones/:id', overToken, (req, res) => {
  const telefon = telefony.find((item) => item.id === Number(req.params.id))
  if (!telefon) {
    return res.status(404).json({ message: 'Telefón neexistuje.' })
  }
  return res.json(telefon)
})

app.patch('/api/phones/:id', overToken, (req, res) => {
  const telefon = telefony.find((item) => item.id === Number(req.params.id))
  if (!telefon) {
    return res.status(404).json({ message: 'Telefón neexistuje.' })
  }

  const { status, assigned_to } = req.body
  if (status) {
    telefon.status = status
  }

  if (assigned_to) {
    telefon.assigned_to = assigned_to
    const user = users.find((item) => item.id === assigned_to)
    telefon.assigned_name = user ? user.name : telefon.assigned_name
  }

  return res.json(telefon)
})

app.delete('/api/phones/:id', overToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin môže mazať telefóny.' })
  }

  const index = telefony.findIndex((item) => item.id === Number(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: 'Telefón neexistuje.' })
  }

  telefony.splice(index, 1)
  return res.status(204).send()
})

app.get('/api/phones/:id/repairs', overToken, (req, res) => {
  res.json(opravy.filter((item) => item.phone_id === Number(req.params.id)))
})

app.post('/api/phones/:id/repairs', overToken, (req, res) => {
  const { date, parts_used, description, service_type, test, button_action, sync } = req.body

  const novaOprava = {
    id: opravy.length + 1,
    phone_id: Number(req.params.id),
    assigned_to: req.user.id,
    repair_date: date,
    parts_used,
    description,
    service_type,
    test_ok: test === 'OK',
    test_nok: test === 'NOK',
    button_action,
    synced_to_sheet: Boolean(sync),
  }

  opravy.unshift(novaOprava)
  return res.status(201).json(novaOprava)
})

app.patch('/api/repairs/:id', overToken, (req, res) => {
  const oprava = opravy.find((item) => item.id === Number(req.params.id))
  if (!oprava) {
    return res.status(404).json({ message: 'Záznam opravy neexistuje.' })
  }

  Object.assign(oprava, req.body)
  return res.json(oprava)
})

app.delete('/api/repairs/:id', overToken, (req, res) => {
  const index = opravy.findIndex((item) => item.id === Number(req.params.id))
  if (index === -1) {
    return res.status(404).json({ message: 'Záznam opravy neexistuje.' })
  }

  opravy.splice(index, 1)
  return res.status(204).send()
})

app.post('/api/repairs/:id/sync', overToken, (req, res) => {
  const oprava = opravy.find((item) => item.id === Number(req.params.id))
  if (!oprava) {
    return res.status(404).json({ message: 'Záznam opravy neexistuje.' })
  }

  if (!oprava.button_action || (!oprava.test_ok && !oprava.test_nok)) {
    return res.status(400).json({ message: 'Pred synchronizáciou nastavte test a tlačidlo 1-4.' })
  }

  oprava.synced_to_sheet = true
  return res.json({ success: true, message: 'Záznam bol označený ako synchronizovaný.' })
})

app.get('/api/messages', overToken, (req, res) => {
  const mojeSpravy = spravy.filter((item) => item.to_user_id === req.user.id || item.from_user_id === req.user.id)
  res.json(mojeSpravy)
})

app.post('/api/messages', overToken, (req, res) => {
  const { to_user_id, phone_id, message } = req.body

  const novaSprava = {
    id: spravy.length + 1,
    from_user_id: req.user.id,
    from_name: req.user.name,
    to_user_id,
    phone_id,
    message,
    read: false,
  }

  spravy.unshift(novaSprava)
  return res.status(201).json(novaSprava)
})

app.patch('/api/messages/:id/read', overToken, (req, res) => {
  const sprava = spravy.find((item) => item.id === Number(req.params.id))
  if (!sprava) {
    return res.status(404).json({ message: 'Správa neexistuje.' })
  }

  sprava.read = true
  return res.json(sprava)
})

app.get('/api/users', overToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin má prístup.' })
  }

  res.json(users.map(({ password, ...bezHesla }) => bezHesla))
})

app.post('/api/users', overToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin má prístup.' })
  }

  const novy = {
    id: users.length + 1,
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role || 'technician',
    employee_code: req.body.employee_code,
  }

  users.push(novy)
  const { password, ...bezHesla } = novy
  res.status(201).json(bezHesla)
})

app.patch('/api/users/:id', overToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Len admin má prístup.' })
  }

  const user = users.find((item) => item.id === Number(req.params.id))
  if (!user) {
    return res.status(404).json({ message: 'Používateľ neexistuje.' })
  }

  Object.assign(user, req.body)
  const { password, ...bezHesla } = user
  res.json(bezHesla)
})

app.get('/api/stats/monthly', overToken, (_req, res) => {
  const dokoncenych = telefony.filter((item) => item.status === 'completed').length
  const testovanie = telefony.filter((item) => item.status === 'testing').length
  const vProcese = telefony.filter((item) => item.status === 'in_progress').length

  res.json({ dokoncenych, testovanie, v_procese: vProcese })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server beží na porte ${port}`)
})
