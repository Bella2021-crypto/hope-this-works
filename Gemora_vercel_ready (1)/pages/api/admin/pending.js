import { ensureReady, query } from '@/lib/db';
import { verify, COOKIE_NAME } from '@/lib/jwt';
import cookie from 'cookie';

export default async function handler(req, res) {
  await ensureReady();

  const raw = req.headers.cookie || '';
  const cookies = cookie.parse(raw);
  const token = cookies[COOKIE_NAME];
  const payload = token ? verify(token) : null;

  if (!payload || payload.role !== 'ADMIN') return res.status(401).end();

  const r = await query(`
    SELECT o.id, o.buyer_email, o.status, l.title
    FROM orders o
    JOIN listings l ON l.id = o.listing_id
    WHERE o.status='PENDING'
    ORDER BY o.id DESC
    LIMIT 50
  `);
  res.json(r.rows);
}
