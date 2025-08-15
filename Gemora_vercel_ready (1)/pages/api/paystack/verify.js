import { ensureReady, query } from '@/lib/db';

export default async function handler(req, res) {
  await ensureReady();

  try {
    const { reference } = req.query || {};
    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ error: 'Missing reference' });
    }

    const r = await fetch('https://api.paystack.co/transaction/verify/' + reference, {
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY }
    });
    const data = await r.json();
    if (!data?.status) return res.status(400).json({ error: data?.message || 'Verification failed' });

    // Only mark PAID when Paystack status says success
    if (data.data?.status === 'success') {
      await query(`UPDATE orders SET status='PAID' WHERE paystack_ref=$1 AND status <> 'PAID'`, [reference]);
      // (Optional) Also lock listing if you want:
      // await query(`UPDATE listings SET status='SOLD' FROM orders o WHERE o.paystack_ref=$1 AND o.listing_id=listings.id`, [reference]);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Payment not successful' });
  } catch (e) {
    console.error('verify error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}
