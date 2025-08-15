import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaystackReturn() {
  const router = useRouter();
  const { reference } = router.query;
  const [status, setStatus] = useState('Verifying payment...');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    // Poll verify endpoint a few times because webhook might land slightly later
    (async () => {
      const attempts = 5;
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetch('/api/paystack/verify?reference=' + reference);
          const data = await res.json();
          if (res.ok) {
            if (!cancelled) {
              setStatus('Payment verified ✅ — Thank you!');
              setDone(true);
            }
            return;
          } else {
            // continue polling on "not successful" for a bit
            if (i < attempts - 1) {
              await new Promise((r) => setTimeout(r, 1500));
              continue;
            }
            if (!cancelled) setStatus('Verification failed: ' + (data.error || 'Unknown error'));
          }
        } catch (e) {
          if (i < attempts - 1) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          if (!cancelled) setStatus('Verification error — please refresh to try again.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <Layout>
      <div className="card" style={{ maxWidth: 560 }}>
        <h3 style={{ marginTop: 0 }}>{status}</h3>
        {done && (
          <div style={{ marginTop: 12 }}>
            <a className="btn" href="/">Go to Home</a>
          </div>
        )}
      </div>
    </Layout>
  );
}
