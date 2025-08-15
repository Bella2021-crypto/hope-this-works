import Layout from '@/components/Layout';
import { useState } from 'react';

export async function getServerSideProps({ params }){
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  const res = await fetch(`${base}/api/listings/${params.id}`).catch(()=>null);
  let item=null; if(res && res.ok) item = await res.json();
  return { props: { item } };
}

export default function Listing({item}){
  const [email,setEmail]=useState(''); const [loading,setLoading]=useState(false);
  async function buy(){
    setLoading(true);
    const res = await fetch('/api/paystack/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ listing_id: item.id, buyer_email: email }) });
    const data = await res.json(); setLoading(false);
    if(res.ok) window.location.href = data.authorization_url; else alert(data.error||'Payment init failed');
  }
  if(!item) return <Layout><div className="card">Listing not found.</div></Layout>;
  return (<Layout>
    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div className="card"><img src={item.image_url || '/logo.svg'} alt={item.title} style={{width:'100%', borderRadius:12}}/></div>
      <div>
        <div className="card">
          <h2 style={{marginTop:0}}>{item.title}</h2>
          <div className="price" style={{fontSize:24}}>₦{(item.price_cents/100).toLocaleString()}</div>
          <p style={{color:'#bfbfbf'}}>{item.description}</p>
          <div style={{marginTop:12}}><label>Enter your email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
          <div style={{marginTop:16}}><button onClick={buy} className="btn" disabled={loading}>Pay with Paystack</button></div>
        </div>
      </div>
    </div>
  </Layout>);
}
