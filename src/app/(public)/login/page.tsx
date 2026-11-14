'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin" /></div>}>
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
  
  // مودال الشروط
  const [isTermsOpen, setIsTermsOpen] = useState(false);

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
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. aya@example.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

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

        <div className="text-center text-[11px] text-[#3D322E] space-y-2 pt-2">
          <p>
            By signing in, you agree to our{' '}
            <button type="button" onClick={() => setIsTermsOpen(true)} className="font-bold text-closea-rosewood hover:underline">
              Terms of Service
            </button>{' '}
            and credit card pre-authorization policies.
          </p>
          <div className="pt-2 border-t border-gray-100">
            Don’t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-[#8B5E56] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Terms of Service" maxWidth="lg">
        <div className="space-y-4 text-sm text-closea-grey leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <p className="font-bold text-closea-ink">مرحباً بك في Closéa (كلوزيا). باستخدامك للمنصة، فإنك توافق على الالتزام بالشروط والأحكام التالية:</p>
          
          <div>
            <strong className="block text-closea-ink mb-1">1. مسؤولية المستأجر (Renter):</strong>
            <p className="text-closea-inkSoft">الفستان أمانة في رقبتك من لحظة استلامه وحتى تسليمه للأتيليه. في حال حدوث أي تلف، بقع، أو تمزق للفستان، يحق للمنصة وصاحب الفستان خصم المبلغ المطلوب من بطاقتك كتعويض.</p>
          </div>

          <div>
            <strong className="block text-closea-ink mb-1">2. مسؤولية صاحب الفستان (Owner):</strong>
            <p className="text-closea-inkSoft">يلتزم صاحب الفستان بتقديم وصف دقيق وحقيقي لحالة الفستان ومقاسه. في حال إلغاء الحجز من طرفه في اللحظات الأخيرة (أقل من 48 ساعة)، يحق للمنصة تغريمه أو تقييد حسابه لتعويض المستأجر.</p>
          </div>

          <div>
            <strong className="block text-closea-ink mb-1">3. بطاقة التأمين (Security Deposit):</strong>
            <p className="text-closea-inkSoft">لضمان سلامة الفستان، يتم عمل حجز مبدئي (Pre-authorization) لمبلغ التأمين على بطاقة الائتمان الخاصة بك عند استلام الفستان من الأتيليه. <strong>هذا المبلغ غير مدفوع، ولن يتم خصمه نهائياً إلا في حالة وجود تلف أو تأخير في الإرجاع.</strong> يتم إلغاء الحجز (Release) تلقائياً بعد فحص الفستان والتأكد من سلامته.</p>
          </div>

          <div>
            <strong className="block text-closea-ink mb-1">4. سياسة التأخير والإلغاء:</strong>
            <p className="text-closea-inkSoft">في حال تأخر المستأجر عن موعد الإرجاع المتفق عليه، يتم خصم مبلغ إضافي عن كل يوم تأخير من حجز البطاقة. يُسمح بإلغاء الحجز واسترداد المبلغ كاملاً قبل موعد الحجز بـ 72 ساعة.</p>
          </div>

          <div>
            <strong className="block text-closea-ink mb-1">5. السرية والخصوصية:</strong>
            <p className="text-closea-inkSoft">المنصة تلتزم بحماية بياناتك الشخصية (الاسم، رقم الهاتف، العنوان) ولا يتم مشاركتها مع أي طرف ثالث إلا في حدود إتمام عملية الحجز (بين المستأجر، صاحب الفستان، والأتيليه).</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex justify-end mt-4">
          <Button onClick={() => setIsTermsOpen(false)} variant="primary">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}