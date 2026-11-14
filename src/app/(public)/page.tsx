'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertCircle, Sparkles, ShoppingBag } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');
  const [location, setLocation] = useState('Qena, Egypt');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // حالة الموافقة على الشروط
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to create an account.');
      return;
    }

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
            Become part of Egypt’s premier luxury dress rental community.
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

          <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aya Khaled" required />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. aya@example.com" required />
          <Input label="City / District" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Qena" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required />

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-closea-rosewood focus:ring-closea-rosewood cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-[#3D322E] leading-relaxed cursor-pointer">
              I agree to the{' '}
              <button type="button" onClick={() => setIsTermsOpen(true)} className="font-bold text-closea-rosewood hover:underline">
                Terms of Service
              </button>{' '}
              and the Certified Atelier Garment Charter, including the credit card pre-authorization policy for security deposits.
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} disabled={!agreeTerms}>
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
          <Button onClick={() => { setAgreeTerms(true); setIsTermsOpen(false); }} variant="primary">
            I Understand & Agree
          </Button>
        </div>
      </Modal>
    </div>
  );
}