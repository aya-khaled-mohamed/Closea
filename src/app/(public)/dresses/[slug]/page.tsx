'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Scissors, CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DressCard } from '@/components/marketplace/DressCard';
import { formatCurrency, formatDate, calculateBookingFinancials } from '@/lib/utils';

export default function DressDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [dress, setDress] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedAtelierId, setSelectedAtelierId] = useState('');
  const [ateliers, setAteliers] = useState<any[]>([]);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [dressRes, atelierRes] = await Promise.all([
          fetch(`/api/dresses/${slug}`),
          fetch('/api/ateliers'),
        ]);

        if (!dressRes.ok) {
          setError('Dress not found');
          return;
        }

        const dressData = await dressRes.json();
        setDress(dressData.dress);

        if (atelierRes.ok) {
          const atelierData = await atelierRes.json();
          setAteliers(atelierData.ateliers || []);
          if (atelierData.ateliers?.length > 0) {
            setSelectedAtelierId(atelierData.ateliers[0].id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dress details');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-closea-inkSoft">Loading dress archive...</p>
      </div>
    );
  }

  if (error || !dress) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-closea-rosewood mx-auto" />
        <h2 className="text-3xl font-extrabold text-closea-ink">Dress Not Found</h2>
        <p className="text-sm font-medium text-closea-inkSoft">This listing may have been deactivated or reserved.</p>
        <Link href="/marketplace">
          <Button variant="outline" size="md">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  const days = start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
      ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      : 1; 

  const financials = calculateBookingFinancials(
    dress.rentalPricePerDay,
    days,
    dress.securityDeposit
  );

  const isDateConflict = Boolean(
    start && end && dress.bookedDates?.some((b: any) => {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        return !(end <= bStart || start >= bEnd);
      })
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!startDate || !endDate) {
      setBookingError('Please select both rental start and end dates');
      return;
    }

    if (isDateConflict) {
      setBookingError('These dates are unavailable. Please choose another date range.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dressId: dress.id,
          startDate,
          endDate,
          specialRequests,
          deliveryAddress,
          selectedAtelierId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/dresses/${slug}`);
          return;
        }
        setBookingError(data.error || 'Failed to submit booking request');
      } else {
        setBookingSuccess(data.booking);
      }
    } catch {
      setBookingError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs font-bold text-closea-inkSoft">
          <Link href="/marketplace" className="inline-flex items-center hover:text-closea-rosewood transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Marketplace
          </Link>
          <div className="flex items-center space-x-2">
            <span>{dress.category?.name}</span>
            <span>/</span>
            <span className="text-closea-ink">{dress.brand}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Image */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
              <Image src={dress.images[activeImageIndex]?.url || dress.images[0]?.url} alt={dress.title} fill priority className="object-cover object-top transition-all duration-500" />
            </div>
            
            {dress.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {dress.images.map((img: any, i: number) => (
                  <button key={img.id} onClick={() => setActiveImageIndex(i)} className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImageIndex === i ? 'border-closea-rosewood shadow-sm scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <Image src={img.url} alt="" fill className="object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Details & Booking */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold uppercase tracking-widest text-closea-rosewood">{dress.brand}</span>
                <div className="flex items-center text-closea-inkSoft font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-closea-rosewood" />
                  <span>{dress.location}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-closea-ink leading-tight">
                {dress.title}
              </h1>

              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-closea-ink">{formatCurrency(dress.rentalPricePerDay)}</span>
                  <span className="text-sm font-medium text-closea-inkSoft ml-1">/ day</span>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-white border border-gray-100">
                <span className="text-closea-inkSoft block text-[10px] font-bold uppercase tracking-wider">Size</span>
                <strong className="text-closea-ink mt-1 block">{dress.size?.label}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-100">
                <span className="text-closea-inkSoft block text-[10px] font-bold uppercase tracking-wider">Condition</span>
                <strong className="text-closea-ink mt-1 block">{dress.condition}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-100">
                <span className="text-closea-inkSoft block text-[10px] font-bold uppercase tracking-wider">Color</span>
                <strong className="text-closea-ink mt-1 block truncate">{dress.color}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-closea-ink">Description</h4>
              <p className="text-sm font-medium text-closea-inkSoft leading-relaxed whitespace-pre-line">{dress.description}</p>
            </div>

            {/* Owner Info */}
            <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {dress.owner?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={dress.owner.avatarUrl} alt={dress.owner.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-closea-blush text-closea-ink flex items-center justify-center font-bold text-sm">{dress.owner?.name?.charAt(0) || 'O'}</div>
                )}
                <div>
                  <p className="text-sm font-bold text-closea-ink">{dress.owner?.name}</p>
                  <p className="text-xs font-medium text-closea-inkSoft">{dress.owner?.profile?.location || 'Qena, Egypt'}</p>
                </div>
              </div>
            </div>

            {/* BOOKING BOX */}
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h4 className="text-xl font-extrabold text-closea-ink">Reserve Your Dates</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-closea-inkSoft mb-1">Rental Start</label>
                  <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-closea-ink bg-white focus:outline-none focus:border-closea-rosewood" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-closea-inkSoft mb-1">Rental Return</label>
                  <input type="date" value={endDate} min={startDate || new Date().toISOString().split('T')[0]} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-closea-ink bg-white focus:outline-none focus:border-closea-rosewood" />
                </div>
              </div>

              {isDateConflict && (
                <div className="p-3 rounded-xl bg-red-50 text-xs text-red-600 flex items-start gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>The dress is already reserved during those dates. Please select alternative dates.</span>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2 pt-2 border-t border-gray-200 text-sm font-medium">
                <div className="flex justify-between text-closea-inkSoft">
                  <span>{formatCurrency(dress.rentalPricePerDay)} × {days} days</span>
                  <span>{formatCurrency(financials.rentalSubtotal)}</span>
                </div>
                
                <div className="flex justify-between text-closea-inkSoft">
                  <span className="flex items-center gap-1.5">
                    Security Deposit
                    <span className="text-[9px] uppercase font-bold text-closea-olive bg-closea-sage/40 px-1.5 py-0.5 rounded">Held at pickup</span>
                  </span>
                  <span>{formatCurrency(financials.securityDeposit)}</span>
                </div>
                
                <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-closea-ink text-base">
                  <span>Due Now</span>
                  <span className="text-closea-rosewood">{formatCurrency(financials.totalAmount)}</span>
                </div>
                <p className="text-[11px] text-closea-inkSoft text-center mt-1">
                  * Security deposit will be pre-authorized on your card at the atelier, not charged now.
                </p>
              </div>

              <Button variant="primary" size="lg" disabled={isDateConflict} onClick={() => setIsBookingModalOpen(true)} className="w-full shadow-md mt-2">
                Request Reservation
              </Button>
            </div>
          </div>
        </div>

        {/* Related Dresses */}
        {dress.relatedDresses?.length > 0 && (
          <div className="mt-24 pt-12 border-t border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-extrabold text-closea-ink">More in {dress.category?.name}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dress.relatedDresses.map((item: any) => (
                <DressCard key={item.id} id={item.id} title={item.title} slug={item.slug} brand={item.brand} rentalPricePerDay={item.rentalPricePerDay} originalPrice={item.originalPrice} location={item.location} sizeLabel={item.size?.label || 'One Size'} categoryName={item.category?.name || 'Couture'} imageUrl={item.primaryImageUrl} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => { setIsBookingModalOpen(false); setBookingSuccess(null); setBookingError(null); }} title={bookingSuccess ? 'Request Submitted!' : 'Confirm Reservation'} description={bookingSuccess ? `Reference: ${bookingSuccess.bookingReference}` : `Complete your request for ${dress.title}`} maxWidth="lg">
        {bookingSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-closea-sage/30 text-closea-olive mx-auto flex items-center justify-center"><CheckCircle2 className="w-8 h-8" /></div>
            <div className="space-y-2">
              <h4 className="text-2xl font-extrabold text-closea-ink">Request Dispatched</h4>
              <p className="text-sm font-medium text-closea-inkSoft max-w-sm mx-auto">The owner, <strong>{dress.owner?.name}</strong>, has been notified. You can track it in your dashboard.</p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/dashboard/customer"><Button variant="primary">Go to Dashboard</Button></Link>
              <Button variant="outline" onClick={() => { setIsBookingModalOpen(false); setBookingSuccess(null); }}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-5">
            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 text-xs text-red-600 flex items-center gap-2 font-medium"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{bookingError}</span></div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-closea-ink">Select Partner Atelier</label>
              <select value={selectedAtelierId} onChange={(e) => setSelectedAtelierId(e.target.value)} className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium focus:outline-none focus:ring-2 focus:ring-closea-rosewood">
                {ateliers.map((a) => (<option key={a.id} value={a.id}>{a.name} — {a.address}, {a.city}</option>))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-closea-ink">Delivery Address (Optional)</label>
              <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Leave blank for Atelier pickup" className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium focus:outline-none focus:ring-2 focus:ring-closea-rosewood" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-closea-ink">Special Requests</label>
              <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={2} placeholder="Heel height, fitting preference..." className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium focus:outline-none focus:ring-2 focus:ring-closea-rosewood" />
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-medium space-y-2">
              <div className="flex justify-between text-closea-inkSoft">
                <span>Selected Dates:</span>
                <span className="font-bold text-closea-ink">{formatDate(startDate)} – {formatDate(endDate)} ({days} days)</span>
              </div>
              <div className="flex justify-between text-closea-inkSoft">
                <span>Rental Subtotal:</span>
                <span>{formatCurrency(financials.rentalSubtotal)}</span>
              </div>
              <div className="flex justify-between text-closea-inkSoft">
                <span className="flex items-center gap-1.5">
                  Security Deposit
                  <span className="text-[9px] uppercase font-bold text-closea-olive bg-closea-sage/40 px-1.5 py-0.5 rounded">Held at pickup</span>
                </span>
                <span>{formatCurrency(financials.securityDeposit)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-closea-ink pt-2 border-t border-gray-200">
                <span>Total Due Now:</span>
                <span className="text-closea-rosewood">{formatCurrency(financials.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Submit Request</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}