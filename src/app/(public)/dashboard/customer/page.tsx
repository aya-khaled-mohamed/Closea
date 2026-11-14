'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, Calendar, MapPin, Scissors, ArrowRight, Camera } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDateRange } from '@/lib/utils';
import { DressCard } from '@/components/marketplace/DressCard';

const formatPrice = (amount: number | string | undefined | null) => {
  const num = Number(amount) || 0;
  return `EGP ${num.toLocaleString('en-US')}`;
};

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm font-bold text-closea-inkSoft">Loading Client Portal...</p></div>}>
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

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarBase64, setEditAvatarBase64] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [meRes, bookingsRes, wishlistRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/bookings?as=customer'),
          fetch('/api/wishlist'),
        ]);
        if (!meRes.ok) { router.push('/login?redirect=/dashboard/customer'); return; }
        const meData = await meRes.json(); setCurrentUser(meData.user);
        if (bookingsRes.ok) { const bData = await bookingsRes.json(); setBookings(bData.bookings || []); }
        if (wishlistRes.ok) { const wData = await wishlistRes.json(); setWishlist(wData.wishlist || []); }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    }
    loadDashboard();
  }, [router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 400, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => { setEditAvatarBase64(reader.result as string); };
      reader.readAsDataURL(compressedFile);
    } catch (error) { console.error(error); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone, avatarUrl: editAvatarBase64 }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser((prev: any) => ({ ...prev, ...data.user }));
        setIsEditProfileOpen(false); router.refresh();
      }
    } catch (error) { console.error(error); } finally { setIsSavingProfile(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <Badge variant="sage" dot>Confirmed</Badge>;
      case 'ACTIVE_RENTAL': return <Badge variant="olive" dot>Active Rental</Badge>;
      case 'READY_FOR_COLLECTION': return <Badge variant="sage" dot>Ready for Collection</Badge>;
      case 'PENDING': return <Badge variant="nude" dot>Pending Owner Acceptance</Badge>;
      case 'RETURNED': return <Badge variant="sage">Returned to Atelier</Badge>;
      case 'COMPLETED': return <Badge variant="blush">Completed</Badge>;
      case 'REJECTED': return <Badge variant="grey">Declined</Badge>;
      case 'CANCELLED': return <Badge variant="grey">Cancelled</Badge>;
      default: return <Badge variant="blush">{status}</Badge>;
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm font-bold text-closea-inkSoft">Loading your client portal...</p></div>;

  return (
    <div className="bg-[#FAF7F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-closea-blush shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            {currentUser?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-closea-blush text-closea-ink flex items-center justify-center font-extrabold text-3xl border-4 border-white shadow-sm">{currentUser?.name?.charAt(0)}</div>
            )}
            <div>
              <div className="flex items-center gap-2"><h1 className="text-2xl sm:text-3xl font-extrabold text-closea-ink">Welcome back, {currentUser?.name}</h1><Badge variant="rose">Client Member</Badge></div>
              <p className="text-sm font-medium text-closea-inkSoft mt-1 flex items-center gap-2"><span>{currentUser?.email}</span><span>•</span><span>{currentUser?.profile?.location || 'Qena'}</span></p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => { setEditName(currentUser?.name || ''); setEditPhone(currentUser?.phone || ''); setEditAvatarBase64(null); setIsEditProfileOpen(true); }} className="w-full sm:w-auto font-bold">Edit Profile</Button>
            <Link href="/marketplace" className="w-full sm:w-auto"><Button variant="primary" size="sm" className="w-full shadow-md">Discover More Dresses <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
          </div>
        </div>

        <div className="flex space-x-2 border-b border-gray-200">
          <button onClick={() => setActiveTab('rentals')} className={`flex items-center gap-2 px-5 py-4 border-b-2 text-sm font-bold transition-all ${activeTab === 'rentals' ? 'border-closea-rosewood text-closea-ink' : 'border-transparent text-closea-inkSoft hover:text-closea-ink hover:border-gray-300'}`}><ShoppingBag className="w-5 h-5 text-closea-rosewood" />My Rentals ({bookings.length})</button>
          <button onClick={() => setActiveTab('wishlist')} className={`flex items-center gap-2 px-5 py-4 border-b-2 text-sm font-bold transition-all ${activeTab === 'wishlist' ? 'border-closea-rosewood text-closea-ink' : 'border-transparent text-closea-inkSoft hover:text-closea-ink hover:border-gray-300'}`}><Heart className="w-5 h-5 text-closea-rosewood" />Wishlist ({wishlist.length})</button>
        </div>

        {activeTab === 'rentals' && (
          <div className="space-y-6">
            {bookings.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white p-6 rounded-3xl shadow-soft flex flex-col lg:flex-row gap-6 justify-between items-start">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="relative w-28 h-36 rounded-2xl overflow-hidden bg-closea-blush flex-shrink-0"><Image src={booking.dress?.images[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80'} alt={booking.dress?.title || 'Dress'} fill className="object-cover object-top" /></div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2"><span className="text-xs font-bold uppercase tracking-widest text-closea-rosewood">{booking.dress?.brand}</span><span className="text-gray-300">•</span><span className="text-sm font-bold text-closea-ink">#{booking.bookingReference}</span></div>
                        <Link href={`/dresses/${booking.dress?.slug}`}><h3 className="text-2xl font-extrabold text-closea-ink hover:text-closea-rosewood transition-colors">{booking.dress?.title}</h3></Link>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-closea-inkSoft pt-1">
                          <span className="flex items-center"><Calendar className="w-4 h-4 text-closea-rosewood mr-1.5" />{formatDateRange(booking.startDate, booking.endDate)} ({booking.totalDays} days)</span>
                          <span className="flex items-center"><MapPin className="w-4 h-4 text-closea-rosewood mr-1.5" />Owner: {booking.dress?.owner?.name}</span>
                        </div>
                        {booking.atelierAssignment && (
                          <div className="p-4 rounded-xl bg-closea-sage/20 text-sm text-closea-ink space-y-1 mt-3">
                            <div className="flex items-center justify-between font-bold text-closea-olive"><span className="flex items-center"><Scissors className="w-4 h-4 mr-1.5" />{booking.atelierAssignment.atelier?.name}</span><span className="text-[10px] uppercase tracking-wider bg-white px-2 py-1 rounded-md shadow-sm">Stage: {booking.atelierAssignment.operationalStatus}</span></div>
                            <p className="text-xs font-medium text-closea-inkSoft">Pickup Lounge: {booking.atelierAssignment.atelier?.address}, {booking.atelierAssignment.atelier?.city}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full lg:w-72 flex flex-col justify-between items-start lg:items-end space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-gray-100 lg:pl-6">
                      <div className="flex flex-col items-start lg:items-end space-y-1"><span className="text-xs font-bold uppercase tracking-wider text-closea-inkSoft">Reservation Status</span>{getStatusBadge(booking.status)}</div>
                      <div className="w-full text-sm font-medium space-y-2 text-closea-inkSoft lg:text-right border-t border-gray-100 pt-3">
                        <div className="flex justify-between lg:justify-end gap-3"><span>Rental Rate:</span><span className="font-bold text-closea-ink">{formatPrice(booking.rentalSubtotal)}</span></div>
                        <div className="flex justify-between lg:justify-end gap-3"><span>Security Deposit:</span><span className="font-bold text-closea-ink">{formatPrice(booking.securityDeposit)}</span></div>
                        <div className="flex justify-between lg:justify-end gap-3 font-extrabold text-base text-closea-ink pt-2 border-t border-gray-100"><span>Total:</span><span className="text-closea-rosewood">{formatPrice(booking.totalAmount)}</span></div>
                      </div>
                      {booking.status === 'READY_FOR_COLLECTION' && (<div className="w-full p-3 rounded-xl bg-closea-sage text-center text-sm font-bold text-closea-olive">✨ Ready for Atelier Pickup!</div>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl shadow-soft text-center space-y-4"><div className="w-16 h-16 rounded-full bg-gray-50 text-closea-rosewood mx-auto flex items-center justify-center"><ShoppingBag className="w-8 h-8" /></div><h3 className="text-2xl font-extrabold text-closea-ink">No Active Rentals Yet</h3><p className="text-sm font-medium text-closea-inkSoft max-w-sm mx-auto">You haven&apos;t reserved any dresses yet. Discover iconic couture pieces for your next gala.</p><Link href="/marketplace"><Button variant="primary" size="md" className="mt-2 shadow-md">Browse Marketplace</Button></Link></div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.map((dress) => (<DressCard key={dress.id} id={dress.id} title={dress.title} slug={dress.slug} brand={dress.brand} rentalPricePerDay={dress.rentalPricePerDay} originalPrice={dress.originalPrice} location={dress.location} sizeLabel={dress.size?.label || 'One Size'} categoryName={dress.category?.name || 'Couture'} imageUrl={dress.primaryImageUrl} isWishlisted={true} onWishlistToggle={(id) => { setWishlist(wishlist.filter((w) => w.id !== id)); }} />))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl shadow-soft text-center space-y-4"><div className="w-16 h-16 rounded-full bg-gray-50 text-closea-rosewood mx-auto flex items-center justify-center"><Heart className="w-8 h-8" /></div><h3 className="text-2xl font-extrabold text-closea-ink">Your Wishlist is Empty</h3><p className="text-sm font-medium text-closea-inkSoft max-w-sm mx-auto">Click the heart icon on any dress in the marketplace to save it for upcoming events.</p><Link href="/marketplace"><Button variant="primary" size="md" className="mt-2 shadow-md">Explore Dresses</Button></Link></div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit Profile" description="Update your personal information and profile picture.">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group">
              <label className="cursor-pointer block relative">
                {editAvatarBase64 || currentUser?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editAvatarBase64 || currentUser?.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-closea-blush text-closea-ink flex items-center justify-center font-extrabold text-3xl border-4 border-gray-50 shadow-sm">{currentUser?.name?.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="w-6 h-6 text-white" /></div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <p className="text-xs text-closea-inkSoft font-medium">Click photo to change</p>
          </div>
          <Input label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          <Input label="Phone Number (Optional)" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSavingProfile}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}