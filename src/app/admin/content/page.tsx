'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2 } from 'lucide-react';

export default function AdminContentPage() {
  const [banner, setBanner] = useState('');
  const [email, setEmail] = useState('concierge@closea.com');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        data.settings?.forEach((s: any) => {
          if (s.key === 'BANNER_ANNOUNCEMENT') setBanner(s.value);
          if (s.key === 'SUPPORT_EMAIL') setEmail(s.value);
        });
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    setIsSaving(true); setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) { setSuccessMsg(`Setting "${key}" updated.`); await loadSettings(); }
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#FAF7F6]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Platform Content & Settings" subtitle="Manage marquee banners, platform announcements, and client touchpoints" />

        <main className="p-8 space-y-6 max-w-4xl">
          {successMsg && (<div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2 font-bold"><CheckCircle2 className="w-5 h-5 flex-shrink-0" /><span>{successMsg}</span></div>)}

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <div><h3 className="text-xl font-extrabold text-closea-ink">Global Announcement Marquee</h3><p className="text-sm font-medium text-closea-inkSoft mt-1">Displays across the top header on all public pages.</p></div>
            <div className="space-y-3">
              <textarea value={banner} onChange={(e) => setBanner(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-closea-rosewood" placeholder="e.g. Free fitting included this week!" />
              <div className="flex justify-end"><Button variant="primary" isLoading={isSaving} onClick={() => handleSaveSetting('BANNER_ANNOUNCEMENT', banner)}>Save Announcement</Button></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-xl font-extrabold text-closea-ink">Concierge Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Input label="Official Concierge Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => handleSaveSetting('SUPPORT_EMAIL', email)}>Save Email</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}