'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Sparkles,
  ShoppingBag,
  Scissors,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const json = await res.json();
        setData(json.metrics);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, [router]);

  if (isLoading || !data) {
    return (
      <div className="flex w-full min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center bg-[#FAF7F6]">
          <div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const { users, dresses, bookings, finances, operations, commission, categoryBreakdown } = data;

  return (
    <div className="flex w-full min-h-screen bg-[#FAF7F6]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Platform Overview & Governance"
          subtitle="Real-time synchronized database telemetry and operational control"
        />

        <main className="p-8 space-y-8">
          {/* Action Alert for Pending Approvals */}
          {dresses.pending > 0 && (
            <div className="p-4 rounded-2xl bg-closea-blush border border-closea-rosewood/30 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-closea-rosewood flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-closea-ink">
                    {dresses.pending} Dress Listing{dresses.pending > 1 ? 's' : ''} Awaiting Approval
                  </h4>
                  <p className="text-xs font-medium text-closea-inkSoft mt-0.5">
                    Review garment provenance, retail value, and condition before making live.
                  </p>
                </div>
              </div>
              <Link href="/admin/dresses?status=PENDING_APPROVAL">
                <Button variant="primary" size="sm">
                  Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {/* Primary KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white shadow-sm space-y-1 border border-gray-100">
              <div className="flex items-center justify-between text-closea-inkSoft">
                <span className="text-[11px] uppercase tracking-wider font-bold">Gross Volume</span>
                <DollarSign className="w-4 h-4 text-closea-rosewood" />
              </div>
              <p className="text-2xl font-extrabold text-closea-ink">{formatCurrency(finances.grossVolume)}</p>
              <span className="text-xs text-closea-olive flex items-center pt-1 font-bold"><TrendingUp className="w-3.5 h-3.5 mr-1" />Total customer transactions</span>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm space-y-1 border border-gray-100">
              <div className="flex items-center justify-between text-closea-inkSoft">
                <span className="text-[11px] uppercase tracking-wider font-bold">Platform Comm.</span>
                <Sparkles className="w-4 h-4 text-closea-rosewood" />
              </div>
              <p className="text-2xl font-extrabold text-closea-rosewood">{formatCurrency(finances.platformRevenue)}</p>
              <span className="text-xs text-closea-inkSoft block pt-1 font-medium">Net Closéa earnings ({commission.platformFeePercent}%)</span>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm space-y-1 border border-gray-100">
              <div className="flex items-center justify-between text-closea-inkSoft">
                <span className="text-[11px] uppercase tracking-wider font-bold">Active Rentals</span>
                <ShoppingBag className="w-4 h-4 text-closea-olive" />
              </div>
              <p className="text-2xl font-extrabold text-closea-ink">{bookings.active}</p>
              <span className="text-xs text-closea-inkSoft block pt-1 font-medium">{bookings.total} lifetime reservations</span>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm space-y-1 border border-gray-100">
              <div className="flex items-center justify-between text-closea-inkSoft">
                <span className="text-[11px] uppercase tracking-wider font-bold">Registered Members</span>
                <Users className="w-4 h-4 text-closea-ink" />
              </div>
              <p className="text-2xl font-extrabold text-closea-ink">{users.total}</p>
              <span className="text-xs text-closea-inkSoft block pt-1 font-medium">{users.owners} Owners • {users.customers} Renters</span>
            </div>
          </div>

          {/* Secondary Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2"><Scissors className="w-4 h-4 text-closea-olive" /><h3 className="text-xl font-extrabold text-closea-ink">Atelier Logistics</h3></div>
                <Badge variant="olive">{operations.activeAteliers} Boutiques</Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-closea-inkSoft">Pending Tasks:</span><strong className="text-closea-rosewood">{operations.pendingAtelierTasks}</strong></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-closea-inkSoft">Atelier Payouts:</span><strong className="text-closea-ink">{formatCurrency(finances.atelierPayouts)}</strong></div>
              </div>
              <Link href="/admin/ateliers" className="block pt-2"><Button variant="outline" size="sm" className="w-full justify-center">Manage Ateliers</Button></Link>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2"><DollarSign className="w-4 h-4 text-closea-rosewood" /><h3 className="text-xl font-extrabold text-closea-ink">Financial Split</h3></div>
                <Badge variant="sage">Configurable</Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-closea-inkSoft">Owner ({commission.ownerSharePercent}%):</span><strong>{formatCurrency(finances.ownerPayouts)}</strong></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-closea-olive h-1.5 rounded-full" style={{ width: `${commission.ownerSharePercent}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-closea-inkSoft">Platform ({commission.platformFeePercent}%):</span><strong>{formatCurrency(finances.platformRevenue)}</strong></div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-closea-rose h-1.5 rounded-full" style={{ width: `${commission.platformFeePercent}%` }} /></div>
                </div>
              </div>
              <Link href="/admin/finances" className="block pt-2"><Button variant="outline" size="sm" className="w-full justify-center">Modify Splits</Button></Link>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-closea-ink">Category Dist.</h3>
                <span className="text-xs font-bold text-closea-inkSoft">{dresses.total} Total</span>
              </div>
              <div className="space-y-2 text-sm">
                {categoryBreakdown.slice(0, 4).map((cat: any) => (
                  <div key={cat.name} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-closea-inkSoft">{cat.name}</span>
                    <span className="font-bold text-closea-rosewood">{cat.count}</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/dresses" className="block pt-2"><Button variant="outline" size="sm" className="w-full justify-center">Full Inventory</Button></Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}