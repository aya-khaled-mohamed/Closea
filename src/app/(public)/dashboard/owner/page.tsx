'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  AlertCircle,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
// شيلنا formatCurrency من هنا عشان نستخدم دالتنا المحلية
import { formatDate, formatDateRange } from '@/lib/utils';

// دالة محلية مضمونة لعرض العملة بالجنيه المصري
const formatPrice = (amount: number | string | undefined | null) => {
  const num = Number(amount) || 0;
  return `EGP ${num.toLocaleString('en-US')}`;
};

export default function OwnerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-closea-inkSoft">Loading Dress Owner Studio...</p>
        </div>
      }
    >
      <OwnerDashboardContent />
    </Suspense>
  );
}

function OwnerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoOpenNewListing = searchParams.get('action') === 'new-listing';

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dresses, setDresses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Default fallback options in case API fails
  const [categories, setCategories] = useState<any[]>([
    { id: 'gala', name: 'Gala & Opera' },
    { id: 'evening', name: 'Evening & Soiree' },
    { id: 'bridal', name: 'Bridal & Engagement' },
    { id: 'cocktail', name: 'Cocktail' },
  ]);
  
  const [sizes, setSizes] = useState<any[]>([
    { id: 'xs', label: 'XS' },
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' },
  ]);
  
  const [isLoading, setIsLoading] = useState(true);

  // New Listing Modal State
  const [isNewListingOpen, setIsNewListingOpen] = useState(autoOpenNewListing);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sizeId, setSizeId] = useState('');
  const [color, setColor] = useState('Soft Blush');
  const [condition, setCondition] = useState('Pristine');
  const [originalPrice, setOriginalPrice] = useState('');
  const [rentalPricePerDay, setRentalPricePerDay] = useState('');
  const [cleaningFee, setCleaningFee] = useState('25');
  const [securityDeposit, setSecurityDeposit] = useState('100');
  const [location, setLocation] = useState('Qena, Egypt');
  const [description, setDescription] = useState('');
  
  // Images State
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Request Action State (Accept / Reject)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalBookingId, setRejectModalBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meRes, catRes, sizeRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/categories'),
        fetch('/api/sizes'),
      ]);

      if (!meRes.ok) {
        router.push('/login?redirect=/dashboard/owner');
        return;
      }

      const meData = await meRes.json();
      setCurrentUser(meData.user);

      if (catRes.ok) {
        const cData = await catRes.json();
        if (cData.categories && cData.categories.length > 0) {
          setCategories(cData.categories);
          if (!categoryId) setCategoryId(cData.categories[0].id);
        } else if (!categoryId) {
          setCategoryId('gala'); // fallback ID
        }
      } else if (!categoryId) {
        setCategoryId('gala'); // fallback ID
      }

      if (sizeRes.ok) {
        const sData = await sizeRes.json();
        if (sData.sizes && sData.sizes.length > 0) {
          setSizes(sData.sizes);
          if (!sizeId) setSizeId(sData.sizes[0].id);
        } else if (!sizeId) {
          setSizeId('m'); // fallback ID
        }
      } else if (!sizeId) {
        setSizeId('m'); // fallback ID
      }

      // Fetch owner dresses and bookings
      const [dressRes, bookRes] = await Promise.all([
        fetch(`/api/dresses?ownerId=${meData.user.id}`),
        fetch('/api/bookings?as=owner'),
      ]);

      if (dressRes.ok) {
        const dData = await dressRes.json();
        setDresses(dData.dresses || []);
      }

      if (bookRes.ok) {
        const bData = await bookRes.json();
        setBookings(bData.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Booking Accept
  const handleAcceptRequest = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Booking Reject
  const handleRejectRequest = async () => {
    if (!rejectModalBookingId) return;
    setActionLoadingId(rejectModalBookingId);
    try {
      const res = await fetch(`/api/bookings/${rejectModalBookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason: rejectionReason || 'Dates unavailable or garment undergoing inspection.',
        }),
      });
      if (res.ok) {
        setRejectModalBookingId(null);
        setRejectionReason('');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Listing Creation
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setListingError(null);

    if (selectedImages.length === 0) {
      setListingError('Please upload at least one image of the dress.');
      return;
    }

    setIsSubmittingListing(true);

    try {
      // Convert Images to Base64
      const base64Images = await Promise.all(
        selectedImages.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const res = await fetch('/api/dresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          brand,
          categoryId,
          sizeId,
          color,
          condition,
          originalPrice,
          rentalPricePerDay,
          cleaningFee,
          securityDeposit,
          location,
          description,
          images: base64Images, // Send base64 array
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setListingError(data.error || 'Failed to submit listing');
      } else {
        setIsNewListingOpen(false);
        // Reset form
        setTitle('');
        setBrand('');
        setDescription('');
        setOriginalPrice('');
        setRentalPricePerDay('');
        setSelectedImages([]);
        await loadData();
      }
    } catch {
      setListingError('A connection error occurred. Please try again.');
    } finally {
      setIsSubmittingListing(false);
    }
  };

  // Earnings calculations
  const confirmedOrCompletedBookings = bookings.filter((b) =>
    ['CONFIRMED', 'ACTIVE_RENTAL', 'RETURNED', 'COMPLETED'].includes(b.status)
  );
  const totalEarnings = confirmedOrCompletedBookings.reduce((sum, b) => sum + (b.ownerPayout || 0), 0);
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-closea-inkSoft">Loading Dress Owner Studio...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-closea-blush shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {currentUser?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-closea-rose"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-closea-blush text-closea-ink flex items-center justify-center font-editorial text-2xl font-bold">
                {currentUser?.name?.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-closea-ink">
                  {currentUser?.name}&apos;s Studio
                </h1>
                <Badge variant="olive">Curator & Lender</Badge>
              </div>
              <p className="text-xs text-closea-inkSoft mt-1">
                Active Listings: <strong className="text-closea-ink">{dresses.length}</strong> • Bank Payouts:{' '}
                <strong className="text-closea-olive">Verified Active</strong>
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsNewListingOpen(true)}
            className="shadow-card w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            List a New Dress
          </Button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-closea-blush shadow-soft space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-closea-inkSoft">
              Total Accrued Earnings (75% Share)
            </span>
            <p className="font-editorial text-3xl font-normal text-closea-ink">
              {/* استخدمنا formatPrice هنا */}
              {formatPrice(totalEarnings)}
            </p>
            <span className="text-[11px] text-closea-olive flex items-center pt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Settled to verified bank account post-rental
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-closea-blush shadow-soft space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-closea-inkSoft">
              Pending Rental Requests
            </span>
            <p className="font-editorial text-3xl font-normal text-closea-rosewood">
              {pendingRequests.length}
            </p>
            <span className="text-[11px] text-closea-inkSoft block pt-1">
              Awaiting your acceptance or decline
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-closea-blush shadow-soft space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-closea-inkSoft">
              Active Wardrobe Listings
            </span>
            <p className="font-editorial text-3xl font-normal text-closea-ink">
              {dresses.length}
            </p>
            <span className="text-[11px] text-closea-inkSoft block pt-1">
              {dresses.filter((d) => d.status === 'APPROVED').length} Live in Marketplace
            </span>
          </div>
        </div>

        {/* SECTION 1: INCOMING BOOKING REQUESTS (Actionable Accept/Reject) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-closea-rosewood" />
              <h2 className="font-editorial text-2xl font-normal text-closea-ink">
                Incoming Rental Requests
              </h2>
            </div>
            {pendingRequests.length > 0 && (
              <Badge variant="rose">{pendingRequests.length} Needs Attention</Badge>
            )}
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white p-5 rounded-2xl border border-closea-blush shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-closea-ink">
                        #{booking.bookingReference}
                      </span>
                      <span className="text-closea-inkSoft">•</span>
                      <strong className="text-xs text-closea-rosewood">{booking.dress?.title}</strong>
                      <span className="text-closea-inkSoft">•</span>
                      <span className="text-xs text-closea-inkSoft">
                        Renter: <strong className="text-closea-ink">{booking.customer?.name}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-closea-inkSoft">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-closea-rosewood mr-1.5" />
                        {formatDateRange(booking.startDate, booking.endDate)} ({booking.totalDays} days)
                      </span>
                      <span>
                        Your Payout:{' '}
                        <strong className="text-closea-olive">
                          {/* استخدمنا formatPrice هنا */}
                          {formatPrice(booking.ownerPayout)}
                        </strong>
                      </span>
                    </div>

                    {booking.specialRequests && (
                      <p className="text-[11px] text-closea-inkSoft italic pt-1">
                        &ldquo;{booking.specialRequests}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions based on status */}
                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                    {booking.status === 'PENDING' ? (
                      <>
                        <Button
                          variant="sage"
                          size="sm"
                          isLoading={actionLoadingId === booking.id}
                          onClick={() => handleAcceptRequest(booking.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Accept Request
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setRejectModalBookingId(booking.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Decline
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-closea-inkSoft">Status:</span>
                        <Badge
                          variant={
                            booking.status === 'CONFIRMED'
                              ? 'sage'
                              : booking.status === 'ACTIVE_RENTAL'
                              ? 'olive'
                              : booking.status === 'REJECTED'
                              ? 'grey'
                              : 'blush'
                          }
                          dot
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-closea-blush text-center text-xs text-closea-inkSoft">
              No booking requests received yet. As clients reserve your dresses, they will appear here.
            </div>
          )}
        </div>

        {/* SECTION 2: WARDROBE INVENTORY & STATUSES */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl font-normal text-closea-ink">
              My Dress Collection ({dresses.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dresses.map((dress) => {
              const primaryImage =
                dress.images?.find((img: any) => img.isPrimary)?.url ||
                dress.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={dress.id}
                  className="bg-white rounded-2xl border border-closea-blush overflow-hidden shadow-soft flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-closea-blush">
                    <Image src={primaryImage} alt={dress.title} fill className="object-cover object-top" />
                    <div className="absolute top-3 left-3">
                      {dress.status === 'APPROVED' && (
                        <Badge variant="sage" dot>
                          Live in Catalog
                        </Badge>
                      )}
                      {dress.status === 'PENDING_APPROVAL' && (
                        <Badge variant="nude" dot>
                          Pending Curator Review
                        </Badge>
                      )}
                      {dress.status === 'REJECTED' && (
                        <Badge variant="grey">Curator Feedback</Badge>
                      )}
                      {dress.status === 'DEACTIVATED' && (
                        <Badge variant="blush">Deactivated</Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-grow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-closea-rosewood">
                      {dress.brand}
                    </span>
                    <h3 className="font-editorial text-lg font-normal text-closea-ink line-clamp-1">
                      {dress.title}
                    </h3>
                    <div className="flex justify-between text-xs text-closea-inkSoft pt-1">
                      <span>
                        Rate:{' '}
                        <strong className="text-closea-ink">
                          {/* استخدمنا formatPrice هنا */}
                          {formatPrice(dress.rentalPricePerDay)}
                        </strong>{' '}
                        / day
                      </span>
                      <span>{dress.viewsCount || 0} Views</span>
                    </div>

                    {dress.status === 'REJECTED' && dress.rejectionReason && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 space-y-0.5 mt-2">
                        <strong className="block">Curator Feedback:</strong>
                        <p>{dress.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 pt-2 border-t border-closea-blush flex items-center justify-between text-xs">
                    <Link
                      href={`/dresses/${dress.slug}`}
                      className="text-closea-rosewood hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Public Page
                    </Link>
                    <span className="text-closea-inkSoft text-[11px]">
                      Added {formatDate(dress.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL 1: LIST A NEW DRESS */}
      <Modal
        isOpen={isNewListingOpen}
        onClose={() => setIsNewListingOpen(false)}
        title="List an Iconic Dress in Closéa"
        description="Submit your designer dress to our curation team. Once verified, it becomes available to rent across Qena."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateListing} className="space-y-5 max-h-[75vh] overflow-y-auto px-1">
          {listingError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{listingError}</span>
            </div>
          )}

          {/* Row 1: Brand + Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Designer Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Jacquemus, Khaite, Zimmermann"
              required
            />

            <Input
              label="Dress Title / Silhouette"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aurelia Silk Column Gown"
              required
            />
          </div>

          {/* Row 2: Category + Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-closea-ink">
                Occasion Category
              </label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#E8DFDD] text-xs text-closea-ink bg-white focus:outline-none focus:border-closea-rosewood focus:ring-2 focus:ring-closea-blush appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-closea-rosewood absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-closea-ink">
                Size
              </label>
              <div className="relative">
                <select
                  value={sizeId}
                  onChange={(e) => setSizeId(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#E8DFDD] text-xs text-closea-ink bg-white focus:outline-none focus:border-closea-rosewood focus:ring-2 focus:ring-closea-blush appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select size</option>
                  {sizes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-closea-rosewood absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 3: Color + Retail + Rental */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Color Tone"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Soft Blush"
              required
            />

            <Input
              label="Retail Price (EGP)"
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 1950"
              helperText="Original purchase price"
            />

            <Input
              label="Rental Price / Day (EGP)"
              type="number"
              value={rentalPricePerDay}
              onChange={(e) => setRentalPricePerDay(e.target.value)}
              placeholder="e.g. 85"
              required
              helperText="Your daily rental rate"
            />
          </div>

          {/* Images Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-closea-ink">
              Editorial Photos (Max 5)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files);
                  if (files.length + selectedImages.length > 5) {
                    alert('You can only upload a maximum of 5 images.');
                    return;
                  }
                  setSelectedImages((prev) => [...prev, ...files]);
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-ink focus:outline-none focus:border-closea-rosewood focus:ring-2 focus:ring-closea-blush file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-closea-blush file:text-closea-rosewood hover:file:bg-closea-nude"
            />
            <p className="text-[11px] text-closea-inkSoft">
              Upload up to 5 high-resolution images. First image will be the main cover.
            </p>
            
            {/* Image Previews */}
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedImages.map((file, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-closea-blush shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-closea-ink">
              Garment Description & Fabric Care
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the fabric (mulberry silk, crepe, velvet), fit advice, lining, and memorable details..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-ink placeholder:text-closea-inkSoft/60 focus:outline-none focus:border-closea-rosewood focus:ring-2 focus:ring-closea-blush"
              required
            />
          </div>

          {/* Advanced Settings (collapsible) */}
          <details className="group rounded-xl border border-closea-blush p-4">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-closea-rosewood hover:underline flex items-center gap-2 list-none">
              <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
              Advanced Settings (optional)
            </summary>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-closea-blush">
              <Input
                label="Cleaning Fee (EGP)"
                type="number"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                placeholder="25"
              />
              <Input
                label="Security Deposit (EGP)"
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="100"
              />
              <Input
                label="Wardrobe Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Qena, Egypt"
              />
            </div>
          </details>

          <div className="pt-3 border-t border-closea-blush flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsNewListingOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingListing}>
              Submit Listing for Curation
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: DECLINE REQUEST MODAL */}
      <Modal
        isOpen={Boolean(rejectModalBookingId)}
        onClose={() => setRejectModalBookingId(null)}
        title="Decline Rental Request"
        description="Please provide a brief reason for the renter."
      >
        <div className="space-y-4">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="E.g. Garment currently committed to another fitting or undergoing delicate atelier care..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-ink placeholder:text-closea-inkSoft/60 focus:outline-none focus:border-closea-rosewood focus:ring-2 focus:ring-closea-blush"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRejectModalBookingId(null)}>
              Cancel
            </Button>
            <Button
              variant="dark"
              onClick={handleRejectRequest}
              isLoading={actionLoadingId === rejectModalBookingId}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}