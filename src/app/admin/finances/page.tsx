'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, TrendingUp, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminFinancesPage() {
  const [stats, setStats] = useState<any>(null);
  const [commission, setCommission] = useState({ platformFeePercent: 15, atelierFeePercent: 10, ownerSharePercent: 75 });
  const [platformFee, setPlatformFee] = useState('15');
  const [atelierFee, setAtelierFee] = useState('10');
  const [ownerShare, setOwnerShare] = useState('75');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, commRes] = await Promise.all([fetch('/api/admin/stats'), fetch('/api/admin/commission')]);
      if (statsRes.ok) { const sData = await statsRes.json(); setStats(sData.metrics); }
      if (commRes.ok) {
        const cData = await commRes.json();
        if (cData.commission) {
          setCommission(cData.commission);
          setPlatformFee(cData.commission.platformFeePercent.toString());
          setAtelierFee(cData.commission.atelierFeePercent.toString());
          setOwnerShare(cData.commission.ownerSharePercent.toString());
        }
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault(); setFeedback(null);
    const p = parseFloat(platformFee); const a = parseFloat(atelierFee); const o = parseFloat(ownerShare);
    const sum = Math.round((p + a + o) * 100) / 100;
    if (sum !== 100) { setFeedback({ type: 'error', message: `Total must equal 100%. Current: ${sum}%` }); return; }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformFeePercent: p, atelierFeePercent: a, ownerSharePercent: o }),
      });
      const data = await res.json();
      if (!res.ok) setFeedback({ type: 'error', message: data.error || 'Failed to update' });
      else { setFeedback({ type: 'success', message: `Policy updated: Platform ${p}%, Atelier ${a}%, Owner ${o}%.` }); await loadData(); }
    } catch { setFeedback({ type: 'error', message: 'Network error.' }); } finally { setIsSaving(false); }
  };

  if (isLoading || !stats) {
    return (<div className="flex w-full min-h-screen bg-[#FAF7F6]"><AdminSidebar /><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin" /></div></div>);
  }

  return (
    <div className="flex w-full min-h-screen bg-[#FAF7F6]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Financial Governance & Splits" subtitle="Configure dynamic revenue splits, monitor escrow holds, and disburse payouts" />

        <main className="p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-1"><span className="text-[11px] uppercase tracking-wider font-bold text-closea-inkSoft">Gross Volume</span><p className="text-2xl font-extrabold text-closea-ink">{formatCurrency(stats.finances.grossVolume)}</p><span className="text-xs text-closea-olive flex items-center pt-1 font-bold"><TrendingUp className="w-3.5 h-3.5 mr-1" />Total customer spend</span></div>
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-1"><span className="text-[11px] uppercase tracking-wider font-bold text-closea-inkSoft">Platform Rev.</span><p className="text-2xl font-extrabold text-closea-rosewood">{formatCurrency(stats.finances.platformRevenue)}</p><span className="text-xs font-medium text-closea-inkSoft block pt-1">Active fee: {commission.platformFeePercent}%</span></div>
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-1"><span className="text-[11px] uppercase tracking-wider font-bold text-closea-inkSoft">Owner Payouts</span><p className="text-2xl font-extrabold text-closea-ink">{formatCurrency(stats.finances.ownerPayouts)}</p><span className="text-xs font-medium text-closea-inkSoft block pt-1">Share ({commission.ownerSharePercent}%)</span></div>
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-1"><span className="text-[11px] uppercase tracking-wider font-bold text-closea-inkSoft">Atelier Fees</span><p className="text-2xl font-extrabold text-closea-olive">{formatCurrency(stats.finances.atelierPayouts)}</p><span className="text-xs font-medium text-closea-inkSoft block pt-1">Eco-care ({commission.atelierFeePercent}%)</span></div>
          </div>

          <div className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-start justify-between">
              <div><div className="flex items-center space-x-2"><Sliders className="w-5 h-5 text-closea-rosewood" /><h3 className="text-xl font-extrabold text-closea-ink">Commission Engine</h3></div><p className="text-sm font-medium text-closea-inkSoft mt-1">Adjust distribution. All calculations in the booking engine automatically derive from these active parameters.</p></div>
              <Badge variant="olive">Live Sync</Badge>
            </div>

            {feedback && (<div className={`p-4 rounded-xl text-sm flex items-center gap-2 font-bold ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}{feedback.message}</div>)}

            <form onSubmit={handleUpdateCommission} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <label className="block text-sm font-bold text-closea-ink">Platform Fee (%)</label>
                  <div className="flex items-center gap-2"><input type="number" step="0.5" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-extrabold text-closea-rosewood focus:outline-none focus:ring-2 focus:ring-closea-rosewood" required /><span className="font-bold text-closea-inkSoft">%</span></div>
                  <p className="text-[10px] text-closea-inkSoft font-medium">Retained by Closéa.</p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <label className="block text-sm font-bold text-closea-ink">Atelier Fee (%)</label>
                  <div className="flex items-center gap-2"><input type="number" step="0.5" value={atelierFee} onChange={(e) => setAtelierFee(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-extrabold text-closea-olive focus:outline-none focus:ring-2 focus:ring-closea-rosewood" required /><span className="font-bold text-closea-inkSoft">%</span></div>
                  <p className="text-[10px] text-closea-inkSoft font-medium">Allocated to partner ateliers.</p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <label className="block text-sm font-bold text-closea-ink">Owner Share (%)</label>
                  <div className="flex items-center gap-2"><input type="number" step="0.5" value={ownerShare} onChange={(e) => setOwnerShare(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-extrabold text-closea-ink focus:outline-none focus:ring-2 focus:ring-closea-rosewood" required /><span className="font-bold text-closea-inkSoft">%</span></div>
                  <p className="text-[10px] text-closea-inkSoft font-medium">Paid directly to owners.</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm font-bold text-closea-ink"><span>Split Visualizer</span><span>Total: {Number(platformFee || 0) + Number(atelierFee || 0) + Number(ownerShare || 0)}%</span></div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex"><div style={{ width: `${platformFee}%` }} className="bg-closea-rose" /><div style={{ width: `${atelierFee}%` }} className="bg-closea-sage" /><div style={{ width: `${ownerShare}%` }} className="bg-closea-olive" /></div>
              </div>
              <div className="flex justify-end pt-2"><Button type="submit" variant="primary" isLoading={isSaving}>Save Commission Policy</Button></div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}