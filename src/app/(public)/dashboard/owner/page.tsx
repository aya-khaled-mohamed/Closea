'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusCircle, Clock, CheckCircle2, XCircle, TrendingUp, Calendar, AlertCircle, Eye, ChevronDown, Camera
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate, formatDateRange } from '@/lib/utils';

const formatPrice = (amount: number | string | undefined | null) => {
  const num = Number(amount) || 0;
  return `EGP ${num.toLocaleString('en-US')}`;
};

export default function OwnerDashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm font-bold text-closea-inkSoft">Loading Owner Studio...</p></div>}>
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
  
  const [categories, setCategories] = useState<any[]>([
    { id: 'gala', name: 'Gala & Opera' }, { id: 'evening', name: 'Evening & Soiree' }, { id: 'bridal', name: 'Bridal & Engagement' }, { id: 'cocktail', name: 'Cocktail' },
  ]);
  
  const [sizes, setSizes] = useState<any[]>([
    { id: 'xs', label: 'XS' }, { id: 's', label: 'S' }, { id: 'm', label: 'M' }, { id: 'l', label: 'L' }, { id: 'xl', label: 'XL' },
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
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
  const [rentalPricePerDay, setRentalPricePerDay] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('100');
  const [location, setLocation] = useState('Qena, Egypt');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalBookingId, setRejectModalBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarBase64, setEditAvatarBase64] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // التعديل الجديد: مراقبة تغير الرابط عشان يفتح المودال تلقائياً
  useEffect(() => {
    if (searchParams.get('action') === 'new-listing') {
      setIsNewListingOpen(true);
    }
  }, [searchParams]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meRes, catRes, sizeRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/categories'), fetch('/api/sizes')]);
      if (!meRes.ok) { router.push('/login?redirect=/dashboard/owner'); return; }
      const meData = await meRes.json(); setCurrentUser(meData.user);
      if (catRes.ok) { const cData = await catRes.json(); setCategories(cData.categories || []); if (cData.categories?.length > 0 && !categoryId) setCategoryId(cData.categories[0].id); }
      if (sizeRes.ok) { const sData = await sizeRes.json(); setSizes(sData.sizes || []); if (sData.sizes?.length > 0 && !sizeId) setSizeId(sData.sizes[0].id); }
      const [dressRes, bookRes] = await Promise.all([fetch(`/api/dresses?ownerId=${meData.user.id}`), fetch('/api/bookings?as=owner')]);
      if (dressRes.ok) { const dData = await dressRes.json(); setDresses(dData.dresses || []); }
      if (bookRes.ok) { const bData = await bookRes.json(); setBookings(bData.bookings || []); }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

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

  const handleAcceptRequest = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try { const res = await fetch(`/api/bookings/${bookingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ACCEPT' }) }); if (res.ok) await loadData(); } catch (e) { console.error(e); } finally { setActionLoadingId(null); }
  };

  const handleRejectRequest = async () => {
    if (!rejectModalBookingId) return; setActionLoadingId(rejectModalBookingId);
    try { const res = await fetch(`/api/bookings/${rejectModalBookingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'REJECT', rejectionReason: rejectionReason || 'Dates unavailable.' }) }); if (res.ok) { setRejectModalBookingId(null); setRejectionReason(''); await loadData(); } } catch (e) { console.error(e); } finally { setActionLoadingId(null); }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault(); setListingError(null);
    if (selectedImages.length === 0) { setListingError('Please upload at least one image.'); return; }
    setIsSubmittingListing(true);
    try {
      const base64Images = await Promise.all(selectedImages.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file);
      })));
      const res = await fetch('/api/dresses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, brand, categoryId, sizeId, color, rentalPricePerDay, securityDeposit, location, description, images: base64Images }),
      });
      const data = await res.json();
      if (!res.ok) { setListingError(data.error || 'Failed to submit listing'); } else {
        setIsNewListingOpen(false); setTitle(''); setBrand(''); setDescription(''); setRentalPricePerDay(''); setSelectedImages([]); await loadData();
      }
    } catch { setListingError('A connection error occurred.'); } finally { setIsSubmittingListing(false); }
  };

  const confirmedOrCompletedBookings = bookings.filter((b) => ['CONFIRMED', 'ACTIVE_RENTAL', 'RETURNED', 'COMPLETED'].includes(b.status));
  const totalEarnings = confirmedOrCompletedBookings.reduce((sum, b) => sum + (b.ownerPayout || 0), 0);
  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm font-bold text-closea-inkSoft">Loading Owner Studio...</p></div>;

  return (
    <div className="bg-[#FAF7F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-closea-blush shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              {currentUser?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-closea-blush text-closea-ink flex items-center justify-center font-extrabold text-3xl border-4 border-white shadow-sm">{currentUser?.name?.charAt(0)}</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2"><h1 className="text-2xl sm:text-3xl font-extrabold text-closea-ink">{currentUser?.name}&apos;s Studio</h1><Badge variant="olive">Curator & Lender</Badge></div>
              <p className="text-sm font-medium text-closea-inkSoft mt-1">Active Listings: <strong className="text-closea-ink">{dresses.length}</strong> • Bank Payouts: <strong className="text-closea-olive">Verified Active</strong></p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" size="md" onClick={() => { setEditName(currentUser?.name || ''); setEditPhone(currentUser?.phone || ''); setEditAvatarBase64(null); setIsEditProfileOpen(true); }} className="w-full sm:w-auto font-bold">Edit Profile</Button>
            <Button variant="primary" size="md" onClick={() => setIsNewListingOpen(true)} className="shadow-md w-full sm:w-auto"><PlusCircle className="w-4 h-4 mr-2" />List a New Dress</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white shadow-soft space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-closea-inkSoft">Total Accrued Earnings (75% Share)</span>
            <p className="text-3xl font-extrabold text-closea-ink">{formatPrice(totalEarnings)}</p>
            <span className="text-xs text-closea-olive flex items-center pt-1 font-bold"><TrendingUp className="w-3.5 h-3.5 mr-1" />Settled to verified bank account post-rental</span>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow-soft space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-closea-inkSoft">Pending Rental Requests</span>
            <p className="text-3xl font-extrabold text-closea-rosewood">{pendingRequests.length}</p>
            <span className="text-xs text-closea-inkSoft block pt-1 font-medium">Awaiting your acceptance or decline</span>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow-soft space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-bold text-closea-inkSoft">Active Wardrobe Listings</span>
            <p className="text-3xl font-extrabold text-closea-ink">{dresses.length}</p>
            <span className="text-xs text-closea-inkSoft block pt-1 font-medium">{dresses.filter((d) => d.status === 'APPROVED').length} Live in Marketplace</span>
          </div>
        </div>

        {/* Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2"><Clock className="w-5 h-5 text-closea-rosewood" /><h2 className="text-2xl font-extrabold text-closea-ink">Incoming Rental Requests</h2></div>
            {pendingRequests.length > 0 && <Badge variant="rose">{pendingRequests.length} Needs Attention</Badge>}
          </div>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-closea-ink">#{booking.bookingReference}</span>
                      <span className="text-gray-300">•</span>
                      <strong className="text-sm text-closea-rosewood">{booking.dress?.title}</strong>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-closea-inkSoft font-medium">Renter: <strong className="text-closea-ink">{booking.customer?.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-closea-inkSoft font-medium">
                      <span className="flex items-center"><Calendar className="w-4 h-4 text-closea-rosewood mr-1.5" />{formatDateRange(booking.startDate, booking.endDate)} ({booking.totalDays} days)</span>
                      <span>Your Payout: <strong className="text-closea-olive">{formatPrice(booking.ownerPayout)}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                    {booking.status === 'PENDING' ? (
                      <>
                        <Button variant="sage" size="sm" isLoading={actionLoadingId === booking.id} onClick={() => handleAcceptRequest(booking.id)}><CheckCircle2 className="w-4 h-4 mr-1" />Accept</Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRejectModalBookingId(booking.id)}><XCircle className="w-4 h-4 mr-1" />Decline</Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2"><span className="text-sm font-bold text-closea-inkSoft">Status:</span><Badge variant={booking.status === 'CONFIRMED' ? 'sage' : booking.status === 'ACTIVE_RENTAL' ? 'olive' : booking.status === 'REJECTED' ? 'grey' : 'blush'} dot>{booking.status}</Badge></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (<div className="bg-white p-8 rounded-2xl shadow-soft text-center text-sm font-medium text-closea-inkSoft">No booking requests received yet.</div>)}
        </div>

        {/* Wardrobe */}
        <div className="space-y-6 pt-6">
          <h2 className="text-2xl font-extrabold text-closea-ink">My Dress Collection ({dresses.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dresses.map((dress) => {
              const primaryImage = dress.images?.find((img: any) => img.isPrimary)?.url || dress.images?.[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80';
              return (
                <div key={dress.id} className="bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-[4/3] bg-closea-blush">
                    <Image src={primaryImage} alt={dress.title} fill className="object-cover object-top" />
                    <div className="absolute top-3 left-3">
                      {dress.status === 'APPROVED' && <Badge variant="sage" dot>Live in Catalog</Badge>}
                      {dress.status === 'PENDING_APPROVAL' && <Badge variant="nude" dot>Pending Curator Review</Badge>}
                      {dress.status === 'REJECTED' && <Badge variant="grey">Curator Feedback</Badge>}
                    </div>
                  </div>
                  <div className="p-5 space-y-2 flex-grow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-closea-rosewood">{dress.brand}</span>
                    <h3 className="text-lg font-bold text-closea-ink line-clamp-1">{dress.title}</h3>
                    <div className="flex justify-between text-sm text-closea-inkSoft pt-1 font-medium">
                      <span>Rate: <strong className="text-closea-ink">{formatPrice(dress.rentalPricePerDay)}</strong> / day</span>
                      <span>{dress.viewsCount || 0} Views</span>
                    </div>
                  </div>
                  <div className="p-5 pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
                    <Link href={`/dresses/${dress.slug}`} className="text-closea-rosewood hover:underline inline-flex items-center gap-1 font-bold"><Eye className="w-4 h-4" />View Page</Link>
                    <span className="text-closea-inkSoft text-xs font-medium">Added {formatDate(dress.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Edit Profile */}
      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit Profile" description="Update your information.">
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
          </div>
          <Input label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          <Input label="Phone Number (Optional)" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3"><Button type="button" variant="ghost" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button><Button type="submit" variant="primary" isLoading={isSavingProfile}>Save Changes</Button></div>
        </form>
      </Modal>

      {/* Modal: New Listing */}
      <Modal isOpen={isNewListingOpen} onClose={() => setIsNewListingOpen(false)} title="List an Iconic Dress" description="Submit your designer dress to our curation team." maxWidth="xl">
        <form onSubmit={handleCreateListing} className="space-y-5 max-h-[75vh] overflow-y-auto px-1">
          {listingError && <div className="p-3 rounded-xl bg-red-50 text-xs text-red-600 flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{listingError}</span></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><Input label="Designer Brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Jacquemus" required /><Input label="Dress Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Aurelia Silk Gown" required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5"><label className="block text-sm font-bold text-closea-ink">Occasion Category</label><div className="relative"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium focus:outline-none focus:ring-2 focus:ring-closea-rosewood appearance-none cursor-pointer" required><option value="">Select category</option>{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select><ChevronDown className="w-4 h-4 text-closea-rosewood absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div></div>
            <div className="space-y-1.5"><label className="block text-sm font-bold text-closea-ink">Size</label><div className="relative"><select value={sizeId} onChange={(e) => setSizeId(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium focus:outline-none focus:ring-2 focus:ring-closea-rosewood appearance-none cursor-pointer" required><option value="">Select size</option>{sizes.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}</select><ChevronDown className="w-4 h-4 text-closea-rosewood absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><Input label="Color Tone" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Soft Blush" required /><Input label="Rental Price / Day (EGP)" type="number" value={rentalPricePerDay} onChange={(e) => setRentalPricePerDay(e.target.value)} placeholder="e.g. 85" required /></div>
          <div className="space-y-2"><label className="block text-sm font-bold text-closea-ink">Editorial Photos (Max 5)</label><input type="file" multiple accept="image/*" onChange={(e) => { if (e.target.files) { const files = Array.from(e.target.files); if (files.length + selectedImages.length > 5) { alert('Max 5 images.'); return; } setSelectedImages((prev) => [...prev, ...files]); } }} className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium focus:outline-none focus:ring-2 focus:ring-closea-rosewood file:mr-4 file:py-2 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-closea-rosewood file:text-white hover:file:bg-[#853c4b] cursor-pointer" />{selectedImages.length > 0 && (<div className="flex flex-wrap gap-3 mt-3">{selectedImages.map((file, idx) => (<div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" /><button type="button" onClick={() => setSelectedImages((prev) => prev.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-xl p-1 hover:bg-red-600 transition-colors"><XCircle className="w-4 h-4" /></button></div>))}</div>)}</div>
          <div className="space-y-1.5"><label className="block text-sm font-bold text-closea-ink">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the fabric, fit advice..." className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-closea-rosewood" required /></div>
          <details className="group rounded-xl bg-gray-50 p-4"><summary className="cursor-pointer text-sm font-bold text-closea-rosewood hover:underline flex items-center gap-2 list-none"><ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />Advanced Settings (optional)</summary><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200"><Input label="Security Deposit (EGP)" type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="100" /><Input label="Wardrobe Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Qena, Egypt" /></div></details>
          <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3"><Button type="button" variant="ghost" onClick={() => setIsNewListingOpen(false)}>Cancel</Button><Button type="submit" variant="primary" isLoading={isSubmittingListing}>Submit for Curation</Button></div>
        </form>
      </Modal>

      {/* Modal: Decline Request */}
      <Modal isOpen={Boolean(rejectModalBookingId)} onClose={() => setRejectModalBookingId(null)} title="Decline Request" description="Please provide a brief reason for the renter.">
        <div className="space-y-4"><textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="E.g. Garment currently committed..." rows={3} className="w-full px-4 py-3 rounded-xl border-0 bg-gray-50 text-sm text-closea-ink font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-closea-rosewood" /><div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setRejectModalBookingId(null)}>Cancel</Button><Button variant="dark" onClick={handleRejectRequest} isLoading={actionLoadingId === rejectModalBookingId}>Confirm Decline</Button></div></div>
      </Modal>
    </div>
  );
}