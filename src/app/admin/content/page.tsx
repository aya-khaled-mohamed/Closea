'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminContentPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [banner, setBanner] = useState('');
  const [minDays, setMinDays] = useState('2');
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
        setSettings(data.settings || []);
        data.settings?.forEach((s: any) => {
          if (s.key === 'BANNER_ANNOUNCEMENT') setBanner(s.value);
          if (s.key === 'MIN_RENTAL_DAYS') setMinDays(s.value);
          if (s.key === 'SUPPORT_EMAIL') setEmail(s.value);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSuccessMsg(`Setting "${key}" updated successfully.`);
        await loadSettings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Platform Content & Editorial Settings"
          subtitle="Manage marquee banners, platform announcements, and client touchpoints"
        />

        <main className="p-8 space-y-6 max-w-4xl">
          {successMsg && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Announcement Ticker */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DFDD] shadow-soft space-y-4">
            <div>
              <h3 className="font-editorial text-xl font-normal text-closea-grey">
                Top Announcement Marquee
              </h3>
              <p className="text-xs text-[#3D322E] mt-0.5">
                Displays across the header on all public pages.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose"
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={() => handleSaveSetting('BANNER_ANNOUNCEMENT', banner)}
                >
                  Save Announcement
                </Button>
              </div>
            </div>
          </div>

          {/* Concierge & Rules */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DFDD] shadow-soft space-y-4">
            <h3 className="font-editorial text-xl font-normal text-closea-grey">
              Platform Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  label="Official Concierge Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveSetting('SUPPORT_EMAIL', email)}
                >
                  Save Email
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  label="Minimum Rental Duration (Days)"
                  type="number"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveSetting('MIN_RENTAL_DAYS', minDays)}
                >
                  Save Duration
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
