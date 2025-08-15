import Layout from '@/components/Layout';
import Link from 'next/link';

export async function getServerSideProps(){
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  const res = await fetch(`${base}/api/listings`).catch(()=>null);
  let items = []; if(res && res.ok) items = await res.json();
  return { props: { items } };
}
export default function Home({items}){
  return (<Layout>
    <section className="banner">
      <div className="banner-inner">
        <h1>Gemora — Where Luxury Finds a New Home</h1>
        <p>Buy and sell pre‑loved luxury fashion with confidence.</p>
      </div>
    </section>
    <div className="grid">
      {items.map(x => (
        <Link key={x.id} href={`/listing/${x.id}`} className="card">
          <div style={{position:'relative', width:'100%', aspectRatio:'1/1', borderRadius:12, overflow:'hidden', marginBottom:12}}>
            <img src={x.image_url || '/logo.svg'} alt={x.title} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div style={{fontWeight:800}}>{x.title}</div>
              <div className="price">₦{(x.price_cents/100).toLocaleString()}</div>
            </div>
            <span className="badge">{x.status}</span>
          </div>
        </Link>
      ))}
    </div>
  </Layout>);
}
