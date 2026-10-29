const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { auth } = require('../middleware/auth');

const VALID_TYPES = ['citizen', 'pwd', 'senior', 'non_citizen'];

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const {
      user_type, first_name, last_name, email, password, phone, address,
      disability_id, senior_id, passport_no, nationality,
    } = req.body;

    if (!VALID_TYPES.includes(user_type))
      return res.status(400).json({ message: 'Invalid user type' });
    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ message: 'Missing required fields' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Conditional validation
    if (user_type === 'pwd' && !disability_id)
      return res.status(400).json({ message: 'PWD requires disability ID' });
    if (user_type === 'senior' && !senior_id)
      return res.status(400).json({ message: 'Senior requires senior ID' });
    if (user_type === 'non_citizen' && (!passport_no || !nationality))
      return res.status(400).json({ message: 'Non-citizen requires passport and nationality' });

    const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users
       (user_type, first_name, last_name, email, password_hash, phone, address,
        disability_id, senior_id, passport_no, nationality, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?, 'pending')`,
      [user_type, first_name, last_name, email, hash, phone, address,
       disability_id || null, senior_id || null, passport_no || null, nationality || null]
    );

    res.status(201).json({
      message: 'Registration submitted. Please wait for admin approval before logging in.',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status !== 'active') {
      return res.status(403).json({
        message: 'Account pending approval by admin.',
        status: user.status,
        rejection_reason: user.rejection_reason,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id, first_name: user.first_name, last_name: user.last_name,
        email: user.email, user_type: user.user_type,
        is_admin: user.is_admin, status: user.status,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ME
router.get('/me', auth(), async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, first_name, last_name, email, user_type, phone, address,
     disability_id, senior_id, passport_no, nationality, status, is_admin, created_at
     FROM users WHERE id=?`, [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
});

module.exports = router;