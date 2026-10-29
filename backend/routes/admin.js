const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth(), adminOnly);

// List all users with filter
router.get('/users', async (req, res) => {
  const { status, user_type } = req.query;
  let sql = `SELECT id, user_type, first_name, last_name, email, phone, address,
             disability_id, senior_id, passport_no, nationality, status,
             rejection_reason, created_at, approved_at
             FROM users WHERE is_admin = FALSE`;
  const params = [];
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (user_type) { sql += ' AND user_type = ?'; params.push(user_type); }
  sql += ' ORDER BY created_at DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// Approve
router.post('/users/:id/approve', async (req, res) => {
  const [result] = await db.query(
    `UPDATE users SET status='active', approved_at=NOW(), rejection_reason=NULL
     WHERE id=? AND is_admin=FALSE`, [req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User approved' });
});

// Reject
router.post('/users/:id/reject', async (req, res) => {
  const { reason } = req.body;
  const [result] = await db.query(
    `UPDATE users SET status='rejected', rejection_reason=?
     WHERE id=? AND is_admin=FALSE`, [reason || 'Not specified', req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User rejected' });
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  const [[pending]] = await db.query(`SELECT COUNT(*) c FROM users WHERE status='pending' AND is_admin=FALSE`);
  const [[active]]  = await db.query(`SELECT COUNT(*) c FROM users WHERE status='active' AND is_admin=FALSE`);
  const [[rejected]] = await db.query(`SELECT COUNT(*) c FROM users WHERE status='rejected' AND is_admin=FALSE`);
  const [byType] = await db.query(
    `SELECT user_type, COUNT(*) c FROM users WHERE is_admin=FALSE GROUP BY user_type`
  );
  res.json({ pending: pending.c, active: active.c, rejected: rejected.c, byType });
});

module.exports = router;