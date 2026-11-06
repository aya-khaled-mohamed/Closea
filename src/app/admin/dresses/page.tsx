'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  AlertCircle,
  ExternalLink,
  Tag,
  Star,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDressesPage() {
  const [dresses, setDresses] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Reject Modal
  const [rejectModalDressId, setRejectModalDressId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDresses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/dresses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDresses(data.dresses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDresses();
  }, [statusFilter, search]);

  const handleApprove = async (dressId: string) => {
    try {
      const res = await fetch('/api/admin/dresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dressId, action: 'APPROVE' }),
      });
      if (res.ok) await loadDresses();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFeatured = async (dressId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch('/api/admin/dresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dressId, action: 'TOGGLE_FEATURED', isFeatured: !currentFeatured }),
      });
      if (res.ok) await loadDresses();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    if (!rejectModalDressId || !rejectionReason.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/dresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dressId: rejectModalDressId,
          action: 'REJECT',
          rejectionReason,
        }),
      });
      if (res.ok) {
        setRejectModalDressId(null);
        setRejectionReason('');
        await loadDresses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Dress Curation & Inventory Governance"
          subtitle="Review submitted garments, manage approvals, and enforce designer standards"
        />

        <main className="p-8 space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E8DFDD]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-closea-grey-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by dress, brand, or owner..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              {['all', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-closea-rose text-white shadow-sm'
                      : 'bg-[#FAF7F6] text-closea-grey hover:bg-closea-blush/60'
                  }`}
                >
                  {st === 'all'
                    ? 'All Listings'
                    : st === 'PENDING_APPROVAL'
                    ? 'Pending Approval'
                    : st}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Table / Cards */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : dresses.length > 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8DFDD] overflow-hidden shadow-soft">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F6] border-b border-[#E8DFDD] text-closea-grey uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Dress & Designer</th>
                    <th className="py-3.5 px-6">Owner</th>
                    <th className="py-3.5 px-6">Rate / Day</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Featured</th>
                    <th className="py-3.5 px-6 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-closea-blush">
                  {dresses.map((dress) => {
                    const primaryImg =
                      dress.images.find((i: any) => i.isPrimary)?.url ||
                      dress.images[0]?.url ||
                      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80';

                    return (
                      <tr key={dress.id} className="hover:bg-[#FAF7F6]/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-closea-blush flex-shrink-0">
                              <Image src={primaryImg} alt="" fill className="object-cover object-top" />
                            </div>
                            <div>
                              <strong className="block text-closea-grey font-medium text-sm">
                                {dress.title}
                              </strong>
                              <span className="text-[11px] text-[#8B5E56] font-semibold uppercase">
                                {dress.brand}
                              </span>
                              <span className="text-[#3D322E] ml-2">
                                • {dress.category?.name} • {dress.size?.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-closea-grey">
                          <p className="font-medium">{dress.owner?.name}</p>
                          <p className="text-[11px] text-[#3D322E]">{dress.owner?.email}</p>
                        </td>

                        <td className="py-4 px-6">
                          <span className="font-semibold text-closea-grey">
                            {formatCurrency(dress.rentalPricePerDay)}
                          </span>
                          {dress.originalPrice && (
                            <span className="block text-[10px] text-closea-grey-muted">
                              Retail: {formatCurrency(dress.originalPrice)}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {dress.status === 'APPROVED' && <Badge variant="sage" dot>Approved</Badge>}
                          {dress.status === 'PENDING_APPROVAL' && <Badge variant="nude" dot>Pending Approval</Badge>}
                          {dress.status === 'REJECTED' && <Badge variant="grey">Rejected</Badge>}
                          {dress.status === 'DEACTIVATED' && <Badge variant="blush">Deactivated</Badge>}
                          {dress.rejectionReason && (
                            <p className="text-[10px] text-red-600 max-w-xs mt-1">
                              Reason: {dress.rejectionReason}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleFeatured(dress.id, dress.isFeatured)}
                            className={`p-1.5 rounded-full transition-colors ${
                              dress.isFeatured
                                ? 'bg-closea-rose/20 text-[#8B5E56] hover:bg-closea-rose/30'
                                : 'text-closea-grey-muted hover:text-closea-grey'
                            }`}
                            title="Toggle Homepage Featured"
                          >
                            <Star className={`w-4 h-4 ${dress.isFeatured ? 'fill-current' : ''}`} />
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          {dress.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                variant="sage"
                                size="sm"
                                onClick={() => handleApprove(dress.id)}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200"
                                onClick={() => setRejectModalDressId(dress.id)}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Link href={`/dresses/${dress.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-[#E8DFDD] text-center text-xs text-[#3D322E]">
              No listings found matching the selected filter.
            </div>
          )}
        </main>
      </div>

      {/* REJECTION REASON MODAL */}
      <Modal
        isOpen={Boolean(rejectModalDressId)}
        onClose={() => setRejectModalDressId(null)}
        title="Reject Listing with Curator Feedback"
        description="Provide a clear, respectful reason to help the dress owner understand our curation standards."
      >
        <div className="space-y-4">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="e.g. Does not meet designer authenticity threshold, or image resolution does not reflect editorial standard."
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose"
            required
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setRejectModalDressId(null)}>
              Cancel
            </Button>
            <Button variant="dark" onClick={handleReject} isLoading={isSubmitting}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
