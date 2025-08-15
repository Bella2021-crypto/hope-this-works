import { ensureReady, query } from '@/lib/db';

function isValidEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default async function handler(req, res) {
  await ensureReady();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { listing_id, buyer_email } = req.body || {};
    const listingId = Number.parseInt(listing_id, 10);

    if (!Number.isInteger(listingId) || listingId <= 0 || !isValidEmail(buyer_email)) {
      return res.status(400).json({ error: 'Invalid listing_id or buyer_email' });
    }

    // Ensure listing exists and is active
    const lr = await query(
      'SELECT id, price_cents, title, status FROM listings WHERE id=$1',
      [listingId]
    );
    if (lr.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    const listing = lr.rows[0];
    if (listing.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Listing is not available' });
    }

    // Prevent duplicate pending orders (same buyer + listing still pending)
    const existing = await query(
      `SELECT id FROM orders WHERE listing_id=$1 AND buyer_email=$2 AND status='PENDING' ORDER BY id DESC LIMIT 1`,
      [listing.id, buyer_email]
    );
    if (existing.rows.length) {
      return res.status(200).json({ duplicate_pending: true });
    }

    // Initialize Paystack (amount is already in kobo/cents)
    const initBody = {
      email: buyer_email,
      amount: listing.price_cents,
      metadata: { listing_id: listing.id, title: listing.title },
      callback_url: (process.env.NEXT_PUBLIC_SITE_URL || '') + '/paystack/return'
    };

    const r = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initBody)
    });

    const data = await r.json();
    if (!data?.status) {
      return res.status(400).json({ error: data?.message || 'Paystack init failed' });
    }

    await query(
      `INSERT INTO orders (listing_id, buyer_email, amount_cents, paystack_ref, status)
       VALUES ($1,$2,$3,$4,$5)`,
      [listing.id, buyer_email, listing.price_cents, data.data.reference, 'PENDING']
    );

    res.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference
    });
  } catch (e) {
    console.error('checkout error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}
