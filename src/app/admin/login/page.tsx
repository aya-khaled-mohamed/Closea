'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdminLogin: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid administrator credentials');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Connection failure. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#FAF7F6] p-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E8DFDD] shadow-card space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-closea-blush text-closea-grey text-xs font-semibold uppercase tracking-wider mt-2">
            <Lock className="w-3 h-3 text-[#8B5E56]" />
            <span>Secure Admin Portal</span>
          </div>
          <p className="text-xs text-[#3D322E] font-light pt-1">
            Restricted access. All administrative actions are recorded in immutable audit logs.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Administrator Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@closea.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <Button type="submit" variant="dark" className="w-full mt-2" isLoading={isLoading}>
            Sign In to Closéa Admin
          </Button>
        </form>
      </div>
    </div>
  );
}