const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

// Get services available for the logged-in user's type
router.get('/', auth(), async (req, res) => {
  const [rows] = await db.query(
    `SELECT * FROM services WHERE target_audience IN ('all', ?) ORDER BY name`,
    [req.user.user_type]
  );
  res.json(rows);
});

// Get all services (admin)
router.get('/all', auth(), async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Admin only' });
  const [rows] = await db.query('SELECT * FROM services ORDER BY name');
  res.json(rows);
});

module.exports = router;