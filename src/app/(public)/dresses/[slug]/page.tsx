'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  MapPin,
  ShieldCheck,
  Scissors,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
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

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedAtelierId, setSelectedAtelierId] = useState('');
  const [ateliers, setAteliers] = useState<any[]>([]);

  // Booking Modal & feedback
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Load dress details & ateliers
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
        <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#3D322E]">Loading dress archive...</p>
      </div>
    );
  }

  if (error || !dress) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#8B5E56] mx-auto" />
        <h2 className="font-editorial text-3xl">Dress Not Found</h2>
        <p className="text-xs text-[#3D322E]">This listing may have been deactivated or reserved.</p>
        <Link href="/marketplace">
          <Button variant="outline" size="sm">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate rental days & financials
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const days =
    start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
      ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      : 3; // Default 3 days estimation

  const financials = calculateBookingFinancials(
    dress.rentalPricePerDay,
    days,
    dress.cleaningFee,
    dress.securityDeposit
  );

  // Check if chosen dates conflict with already booked dates
  const isDateConflict = Boolean(
    start &&
      end &&
      dress.bookedDates?.some((b: any) => {
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
      {/* Breadcrumb Bar */}
      <div className="border-b border-closea-blush/80 bg-[#FAF7F6]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-[#3D322E]">
          <Link
            href="/marketplace"
            className="inline-flex items-center hover:text-[#8B5E56] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Marketplace
          </Link>
          <div className="flex items-center space-x-2">
            <span>{dress.category?.name}</span>
            <span>/</span>
            <span className="text-closea-grey font-medium">{dress.brand}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Image Gallery (thumbnails + main display) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-closea-blush shadow-card border border-closea-blush">
              <Image
                src={dress.images[activeImageIndex]?.url || dress.images[0]?.url}
                alt={dress.title}
                fill
                priority
                className="object-cover object-top transition-all duration-500"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="sage" dot>
                  Available to Rent
                </Badge>
                {dress.isFeatured && <Badge variant="rose">Featured Selection</Badge>}
              </div>
            </div>

            {/* Thumbnail Row */}
            {dress.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {dress.images.map((img: any, i: number) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === i
                        ? 'border-closea-rose shadow-sm scale-95'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover object-top" />
                  </button>
                ))}
              </div>
            )}

            {/* Garment Care & Inspection Assurance */}
            <div className="p-6 rounded-2xl bg-[#FAF7F6] border border-closea-blush space-y-4">
              <div className="flex items-center space-x-3 text-closea-olive">
                <Scissors className="w-5 h-5 flex-shrink-0" />
                <h4 className="font-semibold text-xs uppercase tracking-wider text-closea-grey">
                  Closéa Atelier Protocol
                </h4>
              </div>
              <p className="text-xs text-[#3D322E] leading-relaxed">
                Before every handover, our partner atelier steams, inspects seams, and validates the fit of this {dress.brand} dress. Eco-luxury dry cleaning is automatically included upon return.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-closea-grey">
                <span className="flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-closea-olive mr-1.5" />
                  Zero Stains Guarantee
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-closea-olive mr-1.5" />
                  Eco-friendly Solvent Care
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Garment Details & Booking Card */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-[#3D322E] mb-1">
                <span className="font-bold uppercase tracking-widest text-[#8B5E56]">
                  {dress.brand}
                </span>
                <div className="flex items-center text-[#3D322E]">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#8B5E56]" />
                  <span>{dress.location}</span>
                </div>
              </div>

              <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-closea-grey leading-tight">
                {dress.title}
              </h1>

              {/* Pricing Overview */}
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F6] border border-[#E8DFDD] flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-closea-grey">
                    {formatCurrency(dress.rentalPricePerDay)}
                  </span>
                  <span className="text-xs text-[#3D322E] ml-1">/ day</span>
                </div>
                {dress.originalPrice && (
                  <div className="text-right">
                    <span className="text-xs text-closea-grey-muted block line-through">
                      Retail {formatCurrency(dress.originalPrice)}
                    </span>
                    <span className="text-[11px] text-closea-olive font-medium">
                      Save ~{Math.round((1 - (dress.rentalPricePerDay * 3) / dress.originalPrice) * 100)}% on retail
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Garment Attributes Pill Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-white border border-closea-blush">
                <span className="text-[#3D322E] block text-[10px] uppercase">Size</span>
                <strong className="text-closea-grey mt-0.5 block">{dress.size?.label}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-closea-blush">
                <span className="text-[#3D322E] block text-[10px] uppercase">Condition</span>
                <strong className="text-closea-grey mt-0.5 block">{dress.condition}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-closea-blush">
                <span className="text-[#3D322E] block text-[10px] uppercase">Color</span>
                <strong className="text-closea-grey mt-0.5 block truncate">{dress.color}</strong>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-closea-grey">Description & Styling Notes</h4>
              <p className="text-xs text-closea-grey leading-relaxed whitespace-pre-line font-light">
                {dress.description}
              </p>
            </div>

            {/* Rental Terms */}
            {dress.rentalTerms && (
              <div className="p-3 rounded-xl bg-closea-blush/30 border border-closea-blush text-xs text-[#3D322E] space-y-1">
                <span className="font-semibold text-closea-grey block text-[11px] uppercase">Garment Terms:</span>
                <p>{dress.rentalTerms}</p>
              </div>
            )}

            {/* Owner Profile Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DFDD] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {dress.owner?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dress.owner.avatarUrl}
                    alt={dress.owner.name}
                    className="w-10 h-10 rounded-full object-cover border border-closea-nude"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-medium text-sm">
                    {dress.owner?.name?.charAt(0) || 'O'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-closea-grey">{dress.owner?.name}</p>
                    <Badge variant="olive" className="text-[9px] py-0 px-1.5">Verified Curator</Badge>
                  </div>
                  <p className="text-[11px] text-[#3D322E]">{dress.owner?.profile?.location || 'Qena, France'}</p>
                </div>
              </div>
              <span className="text-[11px] text-closea-olive font-medium">100% Response Rate</span>
            </div>

            {/* Date Selection & Reservation Box */}
            <div className="p-6 rounded-3xl bg-[#FAF7F6] border-2 border-closea-nude/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-closea-blush">
                <h4 className="font-editorial text-xl font-normal text-closea-grey">Reserve Your Dates</h4>
                <span className="text-xs text-[#3D322E]">Min. 2 days</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-closea-grey mb-1">
                    Rental Start
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey bg-white focus:outline-none focus:border-closea-rose"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-closea-grey mb-1">
                    Rental Return
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey bg-white focus:outline-none focus:border-closea-rose"
                  />
                </div>
              </div>

              {/* Already Booked Dates Warning (Validation from backend) */}
              {isDateConflict && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>The dress is already reserved during those dates. Please select alternative dates.</span>
                </div>
              )}

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2 pt-2 border-t border-closea-blush text-xs">
                <div className="flex justify-between text-[#3D322E]">
                  <span>
                    {formatCurrency(dress.rentalPricePerDay)} × {days} days
                  </span>
                  <span>{formatCurrency(financials.rentalSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[#3D322E]">
                  <span>Atelier Eco-Cleaning</span>
                  <span>{formatCurrency(financials.cleaningFee)}</span>
                </div>
                <div className="flex justify-between text-[#3D322E]">
                  <span className="flex items-center gap-1">
                    Refundable Security Deposit
                    <span className="text-[10px] text-closea-olive">(Escrow)</span>
                  </span>
                  <span>{formatCurrency(financials.securityDeposit)}</span>
                </div>
                <div className="pt-2 border-t border-closea-blush flex justify-between font-semibold text-closea-grey text-sm">
                  <span>Total (inc. taxes & hold)</span>
                  <span className="text-[#8B5E56]">{formatCurrency(financials.totalAmount)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={isDateConflict}
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full shadow-card mt-2"
              >
                Request Reservation
              </Button>

              <p className="text-[11px] text-center text-[#3D322E]">
                You won’t be charged until the owner accepts your request.
              </p>
            </div>
          </div>
        </div>

        {/* Related Dresses */}
        {dress.relatedDresses?.length > 0 && (
          <div className="mt-24 pt-12 border-t border-closea-blush">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8B5E56]">Similar Elegance</span>
              <h3 className="font-editorial text-3xl font-normal text-closea-grey mt-1">
                More in {dress.category?.name}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dress.relatedDresses.map((item: any) => (
                <DressCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  slug={item.slug}
                  brand={item.brand}
                  rentalPricePerDay={item.rentalPricePerDay}
                  originalPrice={item.originalPrice}
                  location={item.location}
                  sizeLabel={item.size?.label || 'One Size'}
                  categoryName={item.category?.name || 'Couture'}
                  imageUrl={item.primaryImageUrl}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Confirmation / Submission Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingSuccess(null);
          setBookingError(null);
        }}
        title={bookingSuccess ? 'Booking Request Submitted!' : 'Confirm Reservation Request'}
        description={
          bookingSuccess
            ? `Reference: ${bookingSuccess.bookingReference}`
            : `Complete your rental request for ${dress.title}`
        }
        maxWidth="lg"
      >
        {bookingSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#EBF1E9] text-closea-olive mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="font-editorial text-2xl font-normal text-closea-grey">
                Your Request Has Been Dispatched
              </h4>
              <p className="text-xs text-[#3D322E] max-w-sm mx-auto leading-relaxed">
                The owner, <strong>{dress.owner?.name}</strong>, has been notified. You can monitor request acceptance and atelier preparation inside your customer dashboard.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F6] border border-closea-blush text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#3D322E]">Reservation Reference:</span>
                <span className="font-semibold text-closea-grey">{bookingSuccess.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D322E]">Rental Dates:</span>
                <span className="font-semibold text-closea-grey">
                  {formatDate(bookingSuccess.startDate)} – {formatDate(bookingSuccess.endDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D322E]">Total Pre-Authorization:</span>
                <span className="font-semibold text-[#8B5E56]">{formatCurrency(bookingSuccess.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Link href="/dashboard/customer">
                <Button variant="primary">Go to Customer Dashboard</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingSuccess(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-5">
            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Atelier Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
                Select Partner Atelier (Fitting & Pickup Lounge)
              </label>
              <select
                value={selectedAtelierId}
                onChange={(e) => setSelectedAtelierId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey bg-white focus:outline-none focus:border-closea-rose"
              >
                {ateliers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.address}, {a.city}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#3D322E]">
                Our ateliers inspect the dress, provide trial rooms, and handle eco-dry cleaning.
              </p>
            </div>

            {/* Delivery address option */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
                Delivery Address or Hotel in Qena (Optional)
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Leave blank for Atelier boutique pickup lounge"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose"
              />
            </div>

            {/* Special requests / measurements */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
                Special Requests or Atelier Notes
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                placeholder="E.g. Heel height, event date schedule, fitting preference..."
                className="w-full px-4 py-2 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose"
              />
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-[#FAF7F6] border border-closea-blush text-xs space-y-1.5">
              <div className="flex justify-between text-[#3D322E]">
                <span>Selected Dates:</span>
                <span className="font-semibold text-[#2D2522]">
                  {formatDate(startDate)} – {formatDate(endDate)} ({days} days)
                </span>
              </div>
              <div className="flex justify-between text-[#3D322E]">
                <span>Rental Subtotal:</span>
                <span className="font-semibold text-[#2D2522]">{formatCurrency(financials.rentalSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#3D322E]">
                <span>Cleaning & Inspection:</span>
                <span className="font-semibold text-[#2D2522]">{formatCurrency(financials.cleaningFee)}</span>
              </div>
              <div className="flex justify-between text-[#3D322E]">
                <span>Security Deposit (Hold):</span>
                <span className="font-semibold text-[#2D2522]">{formatCurrency(financials.securityDeposit)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-closea-grey pt-1 border-t border-closea-blush">
                <span>Total Amount:</span>
                <span className="text-[#8B5E56]">{formatCurrency(financials.totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Submit Rental Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
