'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDateRange } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [interventionNote, setInterventionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/bookings?${params.toString()}`);
      if (res.ok) { const data = await res.json(); setBookings(data.bookings || []); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { loadBookings(); }, [statusFilter]);

  const handleStatusOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newStatus) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_STATUS', status: newStatus, note: interventionNote || `Admin override to ${newStatus}` }),
      });
      if (res.ok) { setSelectedBooking(null); setInterventionNote(''); await loadBookings(); }
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#FAF7F6]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Reservation & Escrow Management" subtitle="Monitor active rentals, atelier handovers, and platform fee splits" />

        <main className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-sm font-bold text-closea-inkSoft">Filter by State:</span>
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              {['all', 'PENDING', 'CONFIRMED', 'ACTIVE_RENTAL', 'READY_FOR_COLLECTION', 'RETURNED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button key={st} onClick={() => setStatusFilter(st)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === st ? 'bg-closea-ink text-white shadow-sm' : 'bg-gray-50 text-closea-inkSoft hover:bg-gray-100'}`}>
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : bookings.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-closea-inkSoft uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-4 px-6">Ref & Dress</th>
                    <th className="py-4 px-6">Parties</th>
                    <th className="py-4 px-6">Dates</th>
                    <th className="py-4 px-6">Financials</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <strong className="block text-closea-ink text-sm">#{b.bookingReference}</strong>
                        <span className="text-xs font-bold text-closea-rosewood">{b.dress?.title}</span>
                      </td>
                      <td className="py-4 px-6 text-closea-inkSoft">
                        <p><span className="font-bold text-closea-ink">Renter:</span> {b.customer?.name}</p>
                        <p><span className="font-bold text-closea-ink">Owner:</span> {b.dress?.owner?.name}</p>
                      </td>
                      <td className="py-4 px-6 text-closea-inkSoft">
                        <span className="font-medium text-closea-ink">{formatDateRange(b.startDate, b.endDate)}</span>
                        <span className="block text-xs font-bold">{b.totalDays} Days</span>
                      </td>
                      <td className="py-4 px-6">
                        <strong className="block text-closea-ink text-sm">{formatCurrency(b.totalAmount)}</strong>
                        <span className="text-[10px] font-bold text-closea-olive block">Owner Payout: {formatCurrency(b.ownerPayout)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={b.status === 'CONFIRMED' ? 'sage' : b.status === 'ACTIVE_RENTAL' ? 'olive' : b.status === 'PENDING' ? 'nude' : b.status === 'COMPLETED' ? 'blush' : 'grey'} dot>{b.status}</Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedBooking(b); setNewStatus(b.status); }}>Manage</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-gray-100 text-center text-sm font-medium text-closea-inkSoft shadow-sm">No bookings found in this view.</div>
          )}
        </main>
      </div>

      <Modal isOpen={Boolean(selectedBooking)} onClose={() => setSelectedBooking(null)} title="Booking Override" description={`Ref: #${selectedBooking?.bookingReference}`}>
        <form onSubmit={handleStatusOverride} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-closea-ink">Select Updated Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-closea-ink focus:outline-none focus:ring-2 focus:ring-closea-rosewood">
              {['PENDING', 'ACCEPTED', 'CONFIRMED', 'READY_FOR_COLLECTION', 'ACTIVE_RENTAL', 'RETURNED', 'COMPLETED', 'CANCELLED'].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-closea-ink">Intervention Reason</label>
            <textarea value={interventionNote} onChange={(e) => setInterventionNote(e.target.value)} rows={3} placeholder="Reason for override..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-closea-rosewood" required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setSelectedBooking(null)}>Cancel</Button>
            <Button type="submit" variant="dark" isLoading={isSubmitting}>Apply Override</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}