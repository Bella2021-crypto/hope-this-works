import crypto from 'crypto';

function signParams(params, apiSecret) {
  // Remove undefined/empty, sort keys asc, join as key=value&key=value...
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  const toSign = entries.map(([k, v]) => `${k}=${v}`).join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Cloudinary env vars missing' });
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // optionally accept limited allowlisted params (e.g., folder/public_id) from query/body
  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const folder = typeof src.folder === 'string' ? src.folder : undefined;
  const public_id = typeof src.public_id === 'string' ? src.public_id : undefined;

  const signature = signParams({ timestamp, ...(folder ? { folder } : {}), ...(public_id ? { public_id } : {}) }, apiSecret);

  res.json({ cloudName, apiKey, timestamp, signature, ...(folder ? { folder } : {}), ...(public_id ? { public_id } : {}) });
}
