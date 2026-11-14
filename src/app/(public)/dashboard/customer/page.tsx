'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Calendar,
  MapPin,
  Clock,
  Scissors,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateRange } from '@/lib/utils';
import { DressCard } from '@/components/marketplace/DressCard';

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#3D322E]">Loading Client Portal...</p>
        </div>
      }
    >
      <CustomerDashboardContent />
    </Suspense>
  );
}

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'rentals';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session, bookings, and wishlist
  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [meRes, bookingsRes, wishlistRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/bookings?as=customer'),
          fetch('/api/wishlist'),
        ]);

        if (!meRes.ok) {
          router.push('/login?redirect=/dashboard/customer');
          return;
        }

        const meData = await meRes.json();
        setCurrentUser(meData.user);

        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          setBookings(bData.bookings || []);
        }

        if (wishlistRes.ok) {
          const wData = await wishlistRes.json();
          setWishlist(wData.wishlist || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="sage" dot>Confirmed</Badge>;
      case 'ACTIVE_RENTAL':
        return <Badge variant="olive" dot>Active Rental</Badge>;
      case 'READY_FOR_COLLECTION':
        return <Badge variant="sage" dot>Ready for Collection</Badge>;
      case 'PENDING':
        return <Badge variant="nude" dot>Pending Owner Acceptance</Badge>;
      case 'RETURNED':
        return <Badge variant="sage">Returned to Atelier</Badge>;
      case 'COMPLETED':
        return <Badge variant="blush">Completed</Badge>;
      case 'REJECTED':
        return <Badge variant="grey">Declined</Badge>;
      case 'CANCELLED':
        return <Badge variant="grey">Cancelled</Badge>;
      default:
        return <Badge variant="blush">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#3D322E]">Loading your client portal...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Welcome Banner */}
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
              <div className="w-16 h-16 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-editorial text-2xl font-bold">
                {currentUser?.name?.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-closea-grey">
                  Welcome back, {currentUser?.name}
                </h1>
                <Badge variant="rose">Client Member</Badge>
              </div>
              <p className="text-xs text-[#3D322E] mt-1 flex items-center gap-2">
                <span>{currentUser?.email}</span>
                <span>•</span>
                <span>{currentUser?.profile?.location || 'Qena'}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full">
                Discover More Dresses
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex space-x-3 border-b border-[#E8DFDD]">
          <button
            onClick={() => setActiveTab('rentals')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'rentals'
                ? 'border-closea-rose text-closea-grey bg-white/60 rounded-t-xl'
                : 'border-transparent text-[#3D322E] hover:text-closea-grey'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#8B5E56]" />
            My Rentals & Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'wishlist'
                ? 'border-closea-rose text-closea-grey bg-white/60 rounded-t-xl'
                : 'border-transparent text-[#3D322E] hover:text-closea-grey'
            }`}
          >
            <Heart className="w-4 h-4 text-[#8B5E56]" />
            Saved Wishlist ({wishlist.length})
          </button>
        </div>

        {/* TAB 1: RENTALS & BOOKINGS */}
        {activeTab === 'rentals' && (
          <div className="space-y-6">
            {bookings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white p-6 rounded-3xl border border-closea-blush shadow-soft flex flex-col lg:flex-row gap-6 justify-between items-start"
                  >
                    {/* Left: Dress details */}
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <div className="relative w-28 h-36 rounded-2xl overflow-hidden bg-closea-blush flex-shrink-0 border border-closea-blush">
                        <Image
                          src={booking.dress?.images[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80'}
                          alt={booking.dress?.title || 'Dress'}
                          fill
                          className="object-cover object-top"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5E56]">
                            {booking.dress?.brand}
                          </span>
                          <span className="text-xs text-[#3D322E]">•</span>
                          <span className="text-xs font-semibold text-closea-grey">
                            #{booking.bookingReference}
                          </span>
                        </div>

                        <Link href={`/dresses/${booking.dress?.slug}`}>
                          <h3 className="font-editorial text-2xl font-normal text-closea-grey hover:text-[#8B5E56] transition-colors">
                            {booking.dress?.title}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#3D322E] pt-1">
                          <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 text-[#8B5E56] mr-1.5" />
                            {formatDateRange(booking.startDate, booking.endDate)} ({booking.totalDays} days)
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 text-[#8B5E56] mr-1.5" />
                            Owner: {booking.dress?.owner?.name}
                          </span>
                        </div>

                        {/* Partner Atelier status badge */}
                        {booking.atelierAssignment && (
                          <div className="p-3 rounded-xl bg-[#EBF1E9] border border-closea-sage/40 text-xs text-closea-grey space-y-1 mt-2">
                            <div className="flex items-center justify-between font-semibold text-closea-olive">
                              <span className="flex items-center">
                                <Scissors className="w-3.5 h-3.5 mr-1" />
                                {booking.atelierAssignment.atelier?.name}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded-full">
                                Stage: {booking.atelierAssignment.operationalStatus}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#3D322E]">
                              Pickup / Fitting lounge: {booking.atelierAssignment.atelier?.address}, {booking.atelierAssignment.atelier?.city}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status and Financial breakdown */}
                    <div className="w-full lg:w-72 flex flex-col justify-between items-start lg:items-end space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-closea-blush lg:pl-6">
                      <div className="flex flex-col items-start lg:items-end space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-[#3D322E]">
                          Reservation Status
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="w-full text-xs space-y-1 text-[#3D322E] lg:text-right border-t border-closea-blush pt-2">
                        <div className="flex justify-between lg:justify-end gap-3">
                          <span>Rental Rate ({booking.totalDays}d):</span>
                          <span className="font-semibold text-[#2D2522]">{formatCurrency(booking.rentalSubtotal)}</span>
                        </div>
                        <div className="flex justify-between lg:justify-end gap-3">
                          <span>Eco-Cleaning & Fit:</span>
                          <span className="font-semibold text-[#2D2522]">{formatCurrency(booking.cleaningFee)}</span>
                        </div>
                        <div className="flex justify-between lg:justify-end gap-3">
                          <span>Security Deposit (Hold):</span>
                          <span className="font-semibold text-[#2D2522]">{formatCurrency(booking.securityDeposit)}</span>
                        </div>
                        <div className="flex justify-between lg:justify-end gap-3 font-semibold text-sm text-closea-grey pt-1 border-t border-closea-blush">
                          <span>Total Amount:</span>
                          <span className="text-[#8B5E56]">{formatCurrency(booking.totalAmount)}</span>
                        </div>
                      </div>

                      {booking.status === 'READY_FOR_COLLECTION' && (
                        <div className="w-full p-2.5 rounded-xl bg-closea-sage/20 border border-closea-sage text-center text-xs text-closea-olive font-medium">
                          ✨ Ready for boutique pickup at atelier!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-closea-blush text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-closea-blush text-[#8B5E56] mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl font-normal text-closea-grey">No Active Rentals Yet</h3>
                <p className="text-xs text-[#3D322E] max-w-sm mx-auto">
                  You haven&apos;t reserved any dresses yet. Discover iconic couture pieces for your next gala or celebration.
                </p>
                <Link href="/marketplace">
                  <Button variant="primary" size="sm">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((dress) => (
                  <DressCard
                    key={dress.id}
                    id={dress.id}
                    title={dress.title}
                    slug={dress.slug}
                    brand={dress.brand}
                    rentalPricePerDay={dress.rentalPricePerDay}
                    originalPrice={dress.originalPrice}
                    location={dress.location}
                    sizeLabel={dress.size?.label || 'One Size'}
                    categoryName={dress.category?.name || 'Couture'}
                    imageUrl={dress.primaryImageUrl}
                    isWishlisted={true}
                    onWishlistToggle={(id) => {
                      setWishlist(wishlist.filter((w) => w.id !== id));
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-closea-blush text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-closea-blush text-[#8B5E56] mx-auto flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl font-normal text-closea-grey">Your Wishlist is Empty</h3>
                <p className="text-xs text-[#3D322E] max-w-sm mx-auto">
                  Click the heart icon on any dress in the marketplace to save it for upcoming events.
                </p>
                <Link href="/marketplace">
                  <Button variant="primary" size="sm">
                    Explore Dresses
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
