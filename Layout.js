import Link from 'next/link';
export default function Layout({children}){
  return (<div>
    <nav className="nav">
      <div className="container" style={{display:'flex',alignItems:'center',gap:16}}>
        <div className="logo brand">
          <svg viewBox="0 0 64 64" width="24" height="24"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stopColor="#D4AF37"/><stop offset="100%" stopColor="#f7e27e"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="none" stroke="url(#g)" strokeWidth="4"/><path d="M20 40 L32 18 L44 40" stroke="url(#g)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="32" cy="44" r="3" fill="url(#g)"/></svg>
          Gemora
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap:16}}>
          <Link href="/">Home</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/admin-login" className="badge">Admin</Link>
        </div>
      </div>
    </nav>
    <main className="container">{children}</main>
    <div className="footer">© {new Date().getFullYear()} Gemora — Where Luxury Finds a New Home</div>
  </div>);
}
