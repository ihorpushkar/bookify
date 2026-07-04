import { useEffect, useState } from 'react';
import client from '../api/client';

export function ApiStatusBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    client
      .get('/health')
      .then(() => setOffline(false))
      .catch(() => setOffline(true));
  }, []);

  if (!offline) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <strong>API unavailable.</strong> Check{' '}
      <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs">DATABASE_URL</code>{' '}
      in <code className="rounded bg-slate-900 px-1.5 py-0.5 text-xs">backend/.env</code>, then
      start the backend:
      <code className="mx-1 rounded bg-slate-900 px-1.5 py-0.5 text-xs">
        cd backend && npm run dev
      </code>
    </div>
  );
}
