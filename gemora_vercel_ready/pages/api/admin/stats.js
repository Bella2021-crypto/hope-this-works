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

  const r1 = await query('SELECT COALESCE(SUM(amount_cents),0) AS total FROM orders WHERE status=$1', ['PAID']);
  const r2 = await query('SELECT COUNT(*) AS c FROM orders');
  const r3 = await query('SELECT COUNT(*) AS c FROM listings');

  res.json({
    total_revenue: parseInt(r1.rows[0].total || 0, 10),
    orders_count: parseInt(r2.rows[0].c || 0, 10),
    listings_count: parseInt(r3.rows[0].c || 0, 10)
  });
}
