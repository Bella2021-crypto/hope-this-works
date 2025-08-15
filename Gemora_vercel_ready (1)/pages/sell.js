async function submitListing(e){
  e.preventDefault();
  setLoading(true);

  const res = await fetch('/api/listings', { 
    method:'POST', 
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ title, description, price_cents: Math.round(Number(price)*100), image_url: imageUrl })
  });

  const data = await res.json();
  if(res.ok){
    setMsg('Listing created!');
    setTitle('');
    setDescription('');
    setPrice('');
    setImageUrl('');
  } else {
    setMsg(data.error || 'Error creating listing');
  }

  setLoading(false);
}
