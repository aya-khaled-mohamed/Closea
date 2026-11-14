'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Sparkles, User, Scissors } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard/customer';

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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
      } else {
        // Route according to user role
        if (data.user.role === 'OWNER') {
          router.push('/dashboard/owner');
        } else if (data.user.role === 'ATELIER') {
          router.push('/atelier');
        } else if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push(redirectUrl);
        }
        router.refresh();
      }
    } catch {
      setError('An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (testEmail: string, testPass = 'Closea2026!') => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F6]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-closea-blush shadow-card">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <h2 className="font-editorial text-2xl font-normal text-closea-grey pt-2">
            Welcome to Closéa
          </h2>
          <p className="text-xs text-[#3D322E] font-light">
            Sign in to access your wardrobe, track reservations, and discover designer pieces.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. camille.dupont@closea.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-[#3D322E]">
              <input type="checkbox" defaultChecked className="rounded border-closea-nude text-[#8B5E56] mr-2" />
              Remember me
            </label>
            <span className="text-[#8B5E56] hover:underline cursor-pointer">Forgot password?</span>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
            Sign In to Closéa
          </Button>
        </form>

        {/* Demo Fast Account Switcher */}
        <div className="pt-4 border-t border-closea-blush space-y-2">
          <span className="block text-[11px] uppercase font-semibold tracking-wider text-[#3D322E] text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => quickLogin('sophie.laurent@closea.com')}
              className="p-2 rounded-xl bg-[#FAF7F6] border border-closea-blush hover:border-closea-rose text-closea-grey text-left"
            >
              <Sparkles className="w-3 h-3 text-[#8B5E56] mb-1" />
              <strong className="block truncate">Sophie L.</strong>
              <span className="text-[#3D322E]">Dress Owner</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('camille.dupont@closea.com')}
              className="p-2 rounded-xl bg-[#FAF7F6] border border-closea-blush hover:border-closea-rose text-closea-grey text-left"
            >
              <User className="w-3 h-3 text-closea-olive mb-1" />
              <strong className="block truncate">Camille D.</strong>
              <span className="text-[#3D322E]">Customer</span>
            </button>

            <button
              type="button"
              onClick={() => quickLogin('contact@atelier-sainthonore.com')}
              className="p-2 rounded-xl bg-[#FAF7F6] border border-closea-blush hover:border-closea-rose text-closea-grey text-left"
            >
              <Scissors className="w-3 h-3 text-closea-olive mb-1" />
              <strong className="block truncate">Atelier Saint-H.</strong>
              <span className="text-[#3D322E]">Atelier Partner</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#3D322E] pt-2">
          Don’t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-[#8B5E56] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
