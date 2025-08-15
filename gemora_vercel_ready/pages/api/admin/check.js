import { verify, COOKIE_NAME } from '@/lib/jwt';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const raw = req.headers.cookie || '';
  const cookies = cookie.parse(raw);
  const token = cookies[COOKIE_NAME];
  const payload = token ? verify(token) : null;

  if (!payload || payload.role !== 'ADMIN') return res.status(401).end();
  res.json({ ok: true, role: 'ADMIN' });
}
