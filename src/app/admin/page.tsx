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
  CheckCircle2,
  AlertCircle,
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
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const { users, dresses, bookings, finances, operations, commission, categoryBreakdown } = data;

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Platform Overview & Governance"
          subtitle="Real-time synchronized database telemetry and operational control"
        />

        <main className="p-8 space-y-8">
          {/* Action Alert for Pending Approvals */}
          {dresses.pending > 0 && (
            <div className="p-4 rounded-2xl bg-[#F7EFEF] border border-closea-rose/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#8B5E56] flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-closea-grey">
                    {dresses.pending} Dress Listing{dresses.pending > 1 ? 's' : ''} Awaiting Curator Approval
                  </h4>
                  <p className="text-[11px] text-[#3D322E]">
                    Review garment provenance, retail value, and condition before making live.
                  </p>
                </div>
              </div>
              <Link href="/admin/dresses?status=PENDING_APPROVAL">
                <Button variant="primary" size="sm">
                  Review Listings
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {/* Primary KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Financial Gross Volume */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <div className="flex items-center justify-between text-[#3D322E]">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Gross Booking Volume
                </span>
                <DollarSign className="w-4 h-4 text-[#8B5E56]" />
              </div>
              <p className="font-editorial text-3xl font-normal text-closea-grey">
                {formatCurrency(finances.grossVolume)}
              </p>
              <span className="text-[11px] text-closea-olive flex items-center pt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Total customer transactions
              </span>
            </div>

            {/* Platform Commissions */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <div className="flex items-center justify-between text-[#3D322E]">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Platform Commission ({commission.platformFeePercent}%)
                </span>
                <Sparkles className="w-4 h-4 text-[#8B5E56]" />
              </div>
              <p className="font-editorial text-3xl font-normal text-[#8B5E56]">
                {formatCurrency(finances.platformRevenue)}
              </p>
              <span className="text-[11px] text-[#3D322E] block pt-1">
                Net Closéa platform earnings
              </span>
            </div>

            {/* Active Bookings */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <div className="flex items-center justify-between text-[#3D322E]">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Active Rentals & Bookings
                </span>
                <ShoppingBag className="w-4 h-4 text-closea-olive" />
              </div>
              <p className="font-editorial text-3xl font-normal text-closea-grey">
                {bookings.active}
              </p>
              <span className="text-[11px] text-[#3D322E] block pt-1">
                {bookings.total} lifetime reservations
              </span>
            </div>

            {/* Total Users */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-1">
              <div className="flex items-center justify-between text-[#3D322E]">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Registered Members
                </span>
                <Users className="w-4 h-4 text-closea-grey" />
              </div>
              <p className="font-editorial text-3xl font-normal text-closea-grey">
                {users.total}
              </p>
              <span className="text-[11px] text-[#3D322E] block pt-1">
                {users.owners} Owners • {users.customers} Renters
              </span>
            </div>
          </div>

          {/* Secondary Operational Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Atelier Operational Status */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scissors className="w-4 h-4 text-closea-olive" />
                  <h3 className="font-editorial text-xl font-normal text-closea-grey">
                    Atelier Logistics
                  </h3>
                </div>
                <Badge variant="olive">{operations.activeAteliers} Active Boutiques</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-closea-blush">
                  <span className="text-[#3D322E]">Pending Preparation Tasks:</span>
                  <strong className="text-[#8B5E56]">{operations.pendingAtelierTasks}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-closea-blush">
                  <span className="text-[#3D322E]">Total Atelier Share Paid:</span>
                  <strong className="text-closea-grey">{formatCurrency(finances.atelierPayouts)}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#3D322E]">Configured Fee Split:</span>
                  <strong className="text-closea-olive">{commission.atelierFeePercent}% of Subtotal</strong>
                </div>
              </div>

              <Link href="/admin/ateliers" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Manage Ateliers & Tasks
                </Button>
              </Link>
            </div>

            {/* Financial Split Breakdown */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-[#8B5E56]" />
                  <h3 className="font-editorial text-xl font-normal text-closea-grey">
                    Financial Split Rules
                  </h3>
                </div>
                <Badge variant="sage">Configurable</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#3D322E]">Dress Owner Share:</span>
                    <strong>{commission.ownerSharePercent}% ({formatCurrency(finances.ownerPayouts)})</strong>
                  </div>
                  <div className="w-full bg-[#FAF7F6] rounded-full h-2 overflow-hidden">
                    <div className="bg-closea-olive h-2 rounded-full" style={{ width: `${commission.ownerSharePercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#3D322E]">Platform Fee:</span>
                    <strong>{commission.platformFeePercent}% ({formatCurrency(finances.platformRevenue)})</strong>
                  </div>
                  <div className="w-full bg-[#FAF7F6] rounded-full h-2 overflow-hidden">
                    <div className="bg-closea-rose h-2 rounded-full" style={{ width: `${commission.platformFeePercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#3D322E]">Partner Atelier Care:</span>
                    <strong>{commission.atelierFeePercent}% ({formatCurrency(finances.atelierPayouts)})</strong>
                  </div>
                  <div className="w-full bg-[#FAF7F6] rounded-full h-2 overflow-hidden">
                    <div className="bg-closea-sage h-2 rounded-full" style={{ width: `${commission.atelierFeePercent}%` }} />
                  </div>
                </div>
              </div>

              <Link href="/admin/finances" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Modify Commission Splits
                </Button>
              </Link>
            </div>

            {/* Category Distribution */}
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-xl font-normal text-closea-grey">
                  Category Distribution
                </h3>
                <span className="text-xs text-[#3D322E]">{dresses.total} Total</span>
              </div>

              <div className="space-y-2 text-xs">
                {categoryBreakdown.map((cat: any) => (
                  <div key={cat.name} className="flex items-center justify-between py-1.5 border-b border-closea-blush">
                    <span className="text-closea-grey">{cat.name}</span>
                    <span className="font-semibold text-[#8B5E56]">{cat.count}</span>
                  </div>
                ))}
              </div>

              <Link href="/admin/dresses" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full justify-center">
                  View Full Dress Inventory
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
