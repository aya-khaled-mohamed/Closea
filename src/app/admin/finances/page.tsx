'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminFinancesPage() {
  const [stats, setStats] = useState<any>(null);
  const [commission, setCommission] = useState({
    platformFeePercent: 15,
    atelierFeePercent: 10,
    ownerSharePercent: 75,
  });

  const [platformFee, setPlatformFee] = useState('15');
  const [atelierFee, setAtelierFee] = useState('10');
  const [ownerShare, setOwnerShare] = useState('75');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, commRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/commission'),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.metrics);
      }

      if (commRes.ok) {
        const cData = await commRes.json();
        if (cData.commission) {
          setCommission(cData.commission);
          setPlatformFee(cData.commission.platformFeePercent.toString());
          setAtelierFee(cData.commission.atelierFeePercent.toString());
          setOwnerShare(cData.commission.ownerSharePercent.toString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const p = parseFloat(platformFee);
    const a = parseFloat(atelierFee);
    const o = parseFloat(ownerShare);

    const sum = Math.round((p + a + o) * 100) / 100;
    if (sum !== 100) {
      setFeedback({
        type: 'error',
        message: `Total percentage must equal exactly 100%. Current sum: ${sum}% (Platform: ${p}% + Atelier: ${a}% + Owner: ${o}%)`,
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformFeePercent: p,
          atelierFeePercent: a,
          ownerSharePercent: o,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update commission rules' });
      } else {
        setFeedback({
          type: 'success',
          message: `Commission policy successfully updated: Platform ${p}%, Atelier ${a}%, Owner ${o}%. Recorded in activity logs.`,
        });
        await loadData();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error updating policy.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex w-full min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Financial Governance & Commission Policy"
          subtitle="Configure dynamic revenue splits, monitor escrow holds, and disburse payouts"
        />

        <main className="p-8 space-y-8">
          {/* Financial Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#3D322E]">
                Gross Platform Volume
              </span>
              <p className="font-editorial text-3xl font-normal text-closea-grey">
                {formatCurrency(stats.finances.grossVolume)}
              </p>
              <span className="text-[11px] text-closea-olive flex items-center pt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Total customer spend
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#3D322E]">
                Platform Commission
              </span>
              <p className="font-editorial text-3xl font-normal text-[#8B5E56]">
                {formatCurrency(stats.finances.platformRevenue)}
              </p>
              <span className="text-[11px] text-[#3D322E] block pt-1">
                Active fee: {commission.platformFeePercent}%
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#3D322E]">
                Dress Owner Payouts
              </span>
              <p className="font-editorial text-3xl font-normal text-closea-grey">
                {formatCurrency(stats.finances.ownerPayouts)}
              </p>
              <span className="text-[11px] text-[#3D322E] block pt-1">
                Disbursed to curators ({commission.ownerSharePercent}%)
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#3D322E]">
                Atelier Service Fees
              </span>
              <p className="font-editorial text-3xl font-normal text-closea-olive">
                {formatCurrency(stats.finances.atelierPayouts)}
              </p>
              <span className="text-[11px] text-[#3D322E] block pt-1">
                Eco-cleaning & fitting ({commission.atelierFeePercent}%)
              </span>
            </div>
          </div>

          {/* DYNAMIC COMMISSION SPLIT CONFIGURATION FORM */}
          <div className="p-8 rounded-3xl bg-white border border-[#E8DFDD] shadow-soft space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-[#8B5E56]" />
                  <h3 className="font-editorial text-2xl font-normal text-closea-grey">
                    Configurable Commission Engine
                  </h3>
                </div>
                <p className="text-xs text-[#3D322E] mt-1 max-w-xl">
                  Adjust commission distribution without rewriting code. All calculations in the booking engine automatically derive from these active parameters.
                </p>
              </div>
              <Badge variant="olive">Database Configured</Badge>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCommission} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-[#FAF7F6] border border-closea-blush space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
                    Platform Commission (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[#E8DFDD] text-base font-bold text-[#8B5E56] bg-white focus:outline-none focus:border-closea-rose"
                      required
                    />
                    <span className="text-sm font-semibold text-closea-grey">%</span>
                  </div>
                  <p className="text-[10px] text-[#3D322E]">Retained by Closéa for curation & platform operations.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F6] border border-closea-blush space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
                    Atelier Fee (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={atelierFee}
                      onChange={(e) => setAtelierFee(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[#E8DFDD] text-base font-bold text-closea-olive bg-white focus:outline-none focus:border-closea-rose"
                      required
                    />
                    <span className="text-sm font-semibold text-closea-grey">%</span>
                  </div>
                  <p className="text-[10px] text-[#3D322E]">Allocated to partner ateliers for fitting lounge & care.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F6] border border-closea-blush space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
                    Dress Owner Share (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={ownerShare}
                      onChange={(e) => setOwnerShare(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[#E8DFDD] text-base font-bold text-closea-grey bg-white focus:outline-none focus:border-closea-rose"
                      required
                    />
                    <span className="text-sm font-semibold text-closea-grey">%</span>
                  </div>
                  <p className="text-[10px] text-[#3D322E]">Net payout disbursed directly to dress owner bank account.</p>
                </div>
              </div>

              {/* Progress visualizer */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-closea-grey font-medium">
                  <span>Split Visualizer:</span>
                  <span>
                    Total: {Number(platformFee || 0) + Number(atelierFee || 0) + Number(ownerShare || 0)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#FAF7F6] overflow-hidden flex">
                  <div style={{ width: `${platformFee}%` }} className="bg-closea-rose" title="Platform" />
                  <div style={{ width: `${atelierFee}%` }} className="bg-closea-sage" title="Atelier" />
                  <div style={{ width: `${ownerShare}%` }} className="bg-closea-olive" title="Owner" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Save & Apply Commission Policy
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
