import { ensureReady, query } from '@/lib/db';
import { sign, COOKIE_NAME, maxAge } from '@/lib/jwt';
import cookie from 'cookie';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  await ensureReady();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  // Fetch hashed password and role
  const r = await query('SELECT id, email, role, password FROM users WHERE email=$1', [email]);
  if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const user = r.rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok || user.role !== 'ADMIN') return res.status(401).json({ error: 'Invalid credentials' });

  const token = sign({ uid: user.id, role: 'ADMIN' });

  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production'
  }));

  res.json({ ok: true });
}
