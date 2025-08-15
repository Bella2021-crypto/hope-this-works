import { ensureReady, query } from '@/lib/db';
export default async function handler(req,res){
  await ensureReady();
  const { id } = req.query;
  const r = await query('SELECT id,title,description,price_cents,image_url,status FROM listings WHERE id=$1',[id]);
  if(r.rows.length===0) return res.status(404).json({error:'Not found'});
  res.json(r.rows[0]);
}
