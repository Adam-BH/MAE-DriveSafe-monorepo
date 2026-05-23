import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-heading font-bold text-lg">DG</span>
          </div>
          <h1 className="font-heading font-semibold text-h1 text-text-primary">DriveGuard</h1>
          <p className="text-text-muted text-body mt-1">Insurer Portal</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[rgba(43,52,151,0.08)] p-6">
          <h2 className="font-heading font-semibold text-h2 text-text-primary mb-6">Sign in</h2>

          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-small font-medium text-text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md border border-[rgba(43,52,151,0.2)] bg-surface text-text-primary text-body font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="you@insurer.com"
              />
            </div>
            <div>
              <label className="block text-small font-medium text-text-muted mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md border border-[rgba(43,52,151,0.2)] bg-surface text-text-primary text-body font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
