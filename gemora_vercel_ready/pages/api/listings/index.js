import { ensureReady, query } from '@/lib/db';

export default async function handler(req, res) {
  await ensureReady();

  if (req.method === 'GET') {
    const r = await query(
      'SELECT id, title, description, price_cents, image_url, status FROM listings ORDER BY id DESC LIMIT 100'
    );
    return res.json(r.rows);
  }

  if (req.method === 'POST') {
    const { title, description, price_cents, image_url } = req.body || {};
    const priceInt = Number.isFinite(Number(price_cents)) ? Math.max(0, Math.trunc(Number(price_cents))) : NaN;

    if (!title || !description || !Number.isFinite(priceInt))
      return res.status(400).json({ error: 'Missing or invalid fields' });

    const s = await query('SELECT id FROM users WHERE email=$1', ['seller@gemora.test']);
    const sellerId = s.rows[0]?.id ?? null;

    const STATUS = 'ACTIVE';
    const r = await query(
      'INSERT INTO listings (title, description, price_cents, image_url, seller_id, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [title, description, priceInt, image_url || null, sellerId, STATUS]
    );

    return res.json({ id: r.rows[0].id });
  }

  res.status(405).end();
}
