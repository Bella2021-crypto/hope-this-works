import Layout from '@/components/Layout';

export async function getServerSideProps({ req }){
  const cookie = req.headers.cookie || '';
  const res = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/admin/check', { headers: { cookie } }).catch(()=>null);
  if(!res || res.status!==200){ return { redirect: { destination: '/admin-login', permanent: false } }; }
  const stats = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/admin/stats', { headers: { cookie } }).then(r=>r.json()).catch(()=>({}));
  const pending = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/admin/pending', { headers: { cookie } }).then(r=>r.json()).catch(()=>[]);
  return { props: { stats, pending } };
}

export default function Admin({ stats, pending }){
  return (<Layout>
    <h2>Admin Dashboard</h2>
    <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
      <div className="card"><div className="badge">Total sales</div><div className="price" style={{fontSize:28}}>₦{(stats.total_revenue/100||0).toLocaleString()}</div></div>
      <div className="card"><div className="badge">Orders</div><div style={{fontSize:28, fontWeight:800}}>{stats.orders_count||0}</div></div>
      <div className="card"><div className="badge">Listings</div><div style={{fontSize:28, fontWeight:800}}>{stats.listings_count||0}</div></div>
    </div>
    <div className="card" style={{marginTop:16}}>
      <h3 style={{marginTop:0}}>Pending Orders</h3>
      <table className="table">
        <thead><tr><th>ID</th><th>Listing</th><th>Buyer</th><th>Status</th></tr></thead>
        <tbody>{pending.map(p => (<tr key={p.id}><td>{p.id}</td><td>{p.title}</td><td>{p.buyer_email}</td><td><span className="badge">{p.status}</span></td></tr>))}</tbody>
      </table>
    </div>
  </Layout>);
}
