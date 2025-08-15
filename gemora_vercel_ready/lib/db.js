const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function query(text, params) { 
  const c = await pool.connect(); 
  try { 
    return await c.query(text, params); 
  } finally { 
    c.release(); 
  } 
}

async function migrate(){
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS listings (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      image_url TEXT,
      seller_id INTEGER REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER REFERENCES listings(id),
      buyer_email TEXT NOT NULL,
      paystack_ref TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      amount_cents INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function seed(){
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gemora.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Gemora@2025';
  const hashedAdminPass = await bcrypt.hash(adminPass, 10);

  await query(
    `INSERT INTO users (email,password,role) VALUES ($1,$2,'ADMIN') ON CONFLICT (email) DO NOTHING`, 
    [adminEmail, hashedAdminPass]
  );

  const sellerEmail = 'seller@gemora.test', sellerPass = 'password';
  const hashedSellerPass = await bcrypt.hash(sellerPass, 10);

  await query(
    `INSERT INTO users (email,password,role) VALUES ($1,$2,'USER') ON CONFLICT (email) DO NOTHING`, 
    [sellerEmail, hashedSellerPass]
  );

  const s = await query('SELECT id FROM users WHERE email=$1', [sellerEmail]);
  const sellerId = s.rows[0].id;

  const c = await query('SELECT COUNT(*) FROM listings');
  if (parseInt(c.rows[0].count) === 0){
    const items=[
      {t:'Chanel Classic Flap Bag',p:1250000,u:'https://res.cloudinary.com/drbkamqdr/image/upload/v1723611111/sample_bag.jpg',d:'Timeless quilted lambskin in black with gold hardware.'},
      {t:'Rolex Datejust 36',p:3200000,u:'https://res.cloudinary.com/drbkamqdr/image/upload/v1723611111/sample_watch.jpg',d:'Oystersteel and yellow gold with champagne dial.'},
      {t:'Gucci Ace Sneakers',p:210000,u:'https://res.cloudinary.com/drbkamqdr/image/upload/v1723611111/sample_shoes.jpg',d:'Signature web stripe with embroidered bee.'},
      {t:'Hermès Silk Scarf',p:180000,u:'https://res.cloudinary.com/drbkamqdr/image/upload/v1723611111/sample_scarf.jpg',d:'Hand-rolled edges, iconic print.'},
      {t:'Cartier Love Bracelet',p:1500000,u:'https://res.cloudinary.com/drbkamqdr/image/upload/v1723611111/sample_bracelet.jpg',d:'18K yellow gold, size 17.'},
    ];
    for(const i of items){
      await query(
        'INSERT INTO listings (title,description,price_cents,image_url,seller_id,status) VALUES ($1,$2,$3,$4,$5,\'ACTIVE\')',
        [i.t, i.d, i.p, i.u, sellerId]
      );
    }
  }

  const l = await query('SELECT id, price_cents FROM listings ORDER BY id ASC LIMIT 2');
  for (const row of l.rows){
    await query(
      `INSERT INTO orders (listing_id,buyer_email,amount_cents,paystack_ref,status) VALUES ($1,$2,$3,$4,$5)`,
      [row.id, 'buyer@example.com', row.price_cents, 'TESTREF-'+row.id, 'PENDING']
    );
  }
}

let initialized = false; 
async function ensureReady(){ 
  if(initialized) return; 
  await migrate(); 
  await seed(); 
  initialized = true; 
}

module.exports = { query, ensureReady };
