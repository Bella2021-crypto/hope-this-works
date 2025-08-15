import { ensureReady, query } from '@/lib/db';
import crypto from 'crypto';

export const config = { api: { bodyParser: false } };

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
  });
}

export default async function handler(req, res) {
  await ensureReady();

  try {
    const raw = await readBody(req);
    const sigHeader = req.headers['x-paystack-signature'];

    // Verify HMAC-SHA512 signature
    const computed = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(raw)
      .digest('hex');

    if (!sigHeader || sigHeader !== computed) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const evt = JSON.parse(raw);

    if (evt?.event === 'charge.success' && evt?.data?.reference) {
      // Idempotent update; avoid flip-flopping
      await query(`UPDATE orders SET status='PAID' WHERE paystack_ref=$1 AND status <> 'PAID'`, [
        evt.data.reference
      ]);
      // (Optional) Mark listing SOLD similarly to verify.js if desired.
    }

    res.json({ received: true });
  } catch (e) {
    console.error('webhook error:', e);
    res.status(200).json({ received: true }); // Reply 200 to avoid Paystack retries on parse errors
  }
}
