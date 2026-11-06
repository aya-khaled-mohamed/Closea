'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Sparkles, ShoppingBag } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');
  const [location, setLocation] = useState('Qena, France');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, location }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
      } else {
        if (role === 'OWNER') {
          router.push('/dashboard/owner?action=new-listing');
        } else {
          router.push('/dashboard/customer');
        }
        router.refresh();
      }
    } catch {
      setError('An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F6]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-closea-blush shadow-card">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <h2 className="font-editorial text-2xl font-normal text-closea-grey pt-2">
            Join the Closéa Circle
          </h2>
          <p className="text-xs text-[#3D322E] font-light">
            Become part of Qena’s premier luxury dress rental community.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
              I am joining Closéa primarily to:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'CUSTOMER'
                    ? 'border-closea-rose bg-closea-blush/40 shadow-sm'
                    : 'border-[#E8DFDD] hover:border-closea-nude'
                }`}
              >
                <ShoppingBag className={`w-4 h-4 mb-1.5 ${role === 'CUSTOMER' ? 'text-[#8B5E56]' : 'text-[#3D322E]'}`} />
                <strong className="block text-xs text-closea-grey">Rent Dresses</strong>
                <span className="text-[10px] text-[#3D322E]">Find looks for events</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('OWNER')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === 'OWNER'
                    ? 'border-closea-rose bg-closea-blush/40 shadow-sm'
                    : 'border-[#E8DFDD] hover:border-closea-nude'
                }`}
              >
                <Sparkles className={`w-4 h-4 mb-1.5 ${role === 'OWNER' ? 'text-[#8B5E56]' : 'text-[#3D322E]'}`} />
                <strong className="block text-xs text-closea-grey">Lend Dresses</strong>
                <span className="text-[10px] text-[#3D322E]">Monetize wardrobe</span>
              </button>
            </div>
          </div>

          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Camille Dupont"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. camille.dupont@closea.com"
            required
          />

          <Input
            label="City / District"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Qena 75008"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />

          <p className="text-[11px] text-[#3D322E] leading-relaxed">
            By joining, you agree to Closéa&apos;s Terms of Service and Certified Atelier Garment Charter.
          </p>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-[#3D322E] pt-2">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#8B5E56] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
