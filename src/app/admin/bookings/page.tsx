'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ShoppingBag, Search, Calendar, MapPin, Scissors, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatDateRange } from '@/lib/utils';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Intervention modal
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
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleStatusOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newStatus) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_STATUS',
          status: newStatus,
          note: interventionNote || `Admin override status to ${newStatus}`,
        }),
      });

      if (res.ok) {
        setSelectedBooking(null);
        setInterventionNote('');
        await loadBookings();
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
          title="Reservation & Escrow Management"
          subtitle="Monitor active rentals, atelier handovers, and platform fee splits"
        />

        <main className="p-8 space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DFDD]">
            <span className="text-xs font-semibold uppercase tracking-wider text-closea-grey">
              Filter by Reservation State:
            </span>

            <div className="flex items-center space-x-2 overflow-x-auto">
              {['all', 'PENDING', 'CONFIRMED', 'ACTIVE_RENTAL', 'READY_FOR_COLLECTION', 'RETURNED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-closea-rose text-white shadow-sm'
                      : 'bg-[#FAF7F6] text-closea-grey hover:bg-closea-blush/60'
                  }`}
                >
                  {st === 'all' ? 'All Bookings' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8DFDD] overflow-hidden shadow-soft">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F6] border-b border-[#E8DFDD] text-closea-grey uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Reference & Dress</th>
                    <th className="py-3.5 px-6">Parties (Renter / Owner)</th>
                    <th className="py-3.5 px-6">Dates & Duration</th>
                    <th className="py-3.5 px-6">Financial Value</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-closea-blush">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF7F6]/60 transition-colors">
                      <td className="py-4 px-6">
                        <strong className="block text-closea-grey text-sm">
                          #{b.bookingReference}
                        </strong>
                        <span className="text-[11px] text-[#8B5E56] font-medium">
                          {b.dress?.title}
                        </span>
                        <span className="text-[#3D322E] block text-[10px]">
                          {b.dress?.brand}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-closea-grey">
                        <p>
                          <span className="text-[#3D322E]">Renter:</span> <strong>{b.customer?.name}</strong>
                        </p>
                        <p>
                          <span className="text-[#3D322E]">Owner:</span> {b.dress?.owner?.name}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-closea-grey">
                        <span className="font-medium">{formatDateRange(b.startDate, b.endDate)}</span>
                        <span className="block text-[11px] text-[#3D322E]">
                          {b.totalDays} Rental Days
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <strong className="block text-closea-grey text-sm">
                          {formatCurrency(b.totalAmount)}
                        </strong>
                        <span className="text-[10px] text-closea-olive block">
                          Fee: {formatCurrency(b.platformFee)} • Payout: {formatCurrency(b.ownerPayout)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            b.status === 'CONFIRMED'
                              ? 'sage'
                              : b.status === 'ACTIVE_RENTAL'
                              ? 'olive'
                              : b.status === 'PENDING'
                              ? 'nude'
                              : b.status === 'COMPLETED'
                              ? 'blush'
                              : 'grey'
                          }
                          dot
                        >
                          {b.status}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(b);
                            setNewStatus(b.status);
                          }}
                        >
                          Manage Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-[#E8DFDD] text-center text-xs text-[#3D322E]">
              No bookings found in this view.
            </div>
          )}
        </main>
      </div>

      {/* STATUS OVERRIDE MODAL */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Administrative Booking Override"
        description={`Reservation #${selectedBooking?.bookingReference}`}
      >
        <form onSubmit={handleStatusOverride} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
              Select Updated Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey bg-white focus:outline-none focus:border-closea-rose"
            >
              {['PENDING', 'ACCEPTED', 'CONFIRMED', 'READY_FOR_COLLECTION', 'ACTIVE_RENTAL', 'RETURNED', 'COMPLETED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
              Intervention Reason & Audit Note
            </label>
            <textarea
              value={interventionNote}
              onChange={(e) => setInterventionNote(e.target.value)}
              placeholder="e.g. Renter emergency cancellation approved by administrator. Escrow deposit released."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-closea-blush">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedBooking(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="dark" isLoading={isSubmitting}>
              Apply Override
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
