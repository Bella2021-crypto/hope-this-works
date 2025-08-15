import Layout from '@/components/Layout';
import { useState } from 'react';

export default function AdminLogin(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [msg,setMsg]=useState('');
  async function login(e){ e.preventDefault(); const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}); const data=await res.json(); if(res.ok) window.location.href='/admin'; else setMsg(data.error||'Login failed'); }
  return (<Layout>
    <h2>Admin Login</h2>
    <form onSubmit={login} className="card" style={{maxWidth:400}}>
      <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} required />
      <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <div style={{marginTop:12}}><button className="btn">Login</button></div>
      <div style={{marginTop:8, color:'#bfbfbf'}}>{msg}</div>
    </form>
  </Layout>);
}
