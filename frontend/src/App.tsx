import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API responded with ${res.status}`);
        }
        return res.json() as Promise<HealthResponse>;
      })
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Bookify
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Service Booking Platform</h1>
        <p className="mt-2 text-slate-400">Phase 0 — project scaffold</p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm text-slate-400">API health</p>
          {loading && <p className="mt-2 text-slate-300">Checking…</p>}
          {error && (
            <p className="mt-2 text-red-400">
              Backend unavailable: {error}
            </p>
          )}
          {health && (
            <div className="mt-2 space-y-1 text-sm">
              <p>
                Status:{' '}
                <span className="font-medium text-emerald-400">{health.status}</span>
              </p>
              <p className="text-slate-400">Service: {health.service}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
