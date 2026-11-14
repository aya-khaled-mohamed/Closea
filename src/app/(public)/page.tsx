import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { DressCard } from '@/components/marketplace/DressCard';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star,
  Search,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  const featuredDresses = await prisma.dress.findMany({
    where: { status: 'APPROVED', isFeatured: true },
    take: 4,
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      category: true,
      size: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    take: 4,
    include: {
      _count: { select: { dresses: { where: { status: 'APPROVED' } } } },
    },
  });

  return (
    <div className="flex flex-col bg-white">
      
      {/* 1. السكشن الرئيسي (Hero Section) */}
      <section className="relative bg-white pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-[#E8DFDD]">
                <span className="w-2 h-2 rounded-full bg-closea-rose animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-closea-ink">
                  Circular Haute Couture
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-closea-ink tracking-tight leading-[1.15]">
                Wear the dress <br />
                of your dreams.
              </h1>

              <p className="text-base text-closea-inkSoft max-w-md font-medium leading-relaxed">
                Cherish the memory, not the clutter. Closéa connects women who own exceptional designer dresses with women seeking unforgettable looks.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto shadow-sm">
                    Explore The Collection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/owner?action=new-listing" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white border-[#E8DFDD]">
                    Monetize Your Closet
                  </Button>
                </Link>
              </div>

              <div className="pt-6 mt-4 border-t-2 border-[#F2E4E1] flex items-center gap-6">
                <div><p className="text-xl font-extrabold text-closea-ink">10k+</p><p className="text-[10px] font-bold text-closea-inkSoft uppercase tracking-wider mt-0.5">Renters</p></div>
                <div className="w-px h-8 bg-[#E8DFDD]" />
                <div><p className="text-xl font-extrabold text-closea-ink">500+</p><p className="text-[10px] font-bold text-closea-inkSoft uppercase tracking-wider mt-0.5">Dresses</p></div>
                <div className="w-px h-8 bg-[#E8DFDD]" />
                <div><div className="flex items-center gap-1"><p className="text-xl font-extrabold text-closea-ink">4.9</p><Star className="w-3.5 h-3.5 fill-closea-rosewood text-closea-rosewood mb-1" /></div><p className="text-[10px] font-bold text-closea-inkSoft uppercase tracking-wider mt-0.5">Rating</p></div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              <div className="relative aspect-[4/5] lg:aspect-[5/6] rounded-2xl overflow-hidden shadow-lg border border-[#E8DFDD]">
                <Image
                  src="/Closea.png"
                  alt="Elegant Designer Dress"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. كيف يعمل الموقع (How Closéa Works) */}
      <section id="how-it-works" className="py-16 bg-[#FAF7F6] border-y-2 border-[#F2E4E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-closea-ink">How Closéa Works</h2>
            <p className="text-sm font-medium text-closea-inkSoft mt-1">Effortless luxury in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-[#E8DFDD] shadow-sm relative z-10">
              <div className="w-12 h-12 rounded-full bg-closea-blush text-closea-rosewood flex items-center justify-center mx-auto mb-2">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-closea-ink">1. Discover & Book</h3>
              <p className="text-sm font-medium text-closea-inkSoft">Browse our curated archive, select your dates, and request a reservation.</p>
            </div>

            <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-[#E8DFDD] shadow-sm relative z-10">
              <div className="w-12 h-12 rounded-full bg-closea-blush text-closea-rosewood flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-closea-ink">2. Owner Approves</h3>
              <p className="text-sm font-medium text-closea-inkSoft">The dress owner accepts your booking. Payment is held securely in escrow.</p>
            </div>

            <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-[#E8DFDD] shadow-sm relative z-10">
              <div className="w-12 h-12 rounded-full bg-closea-blush text-closea-rosewood flex items-center justify-center mx-auto mb-2">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-closea-ink">3. Wear & Return</h3>
              <p className="text-sm font-medium text-closea-inkSoft">Pick up your perfectly fitted dress from our partner atelier and enjoy your event.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. تصفح حسب المناسبة (Shop by Occasion) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-closea-ink">Shop by Occasion</h2>
              <p className="text-sm font-medium text-closea-inkSoft mt-1">Find the perfect silhouette for your next milestone.</p>
            </div>
            <Link href="/marketplace" className="hidden sm:flex text-sm font-bold text-closea-rosewood hover:underline items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/marketplace?category=${cat.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-[#E8DFDD]"
              >
                <Image
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                  <p className="text-xs font-medium text-white/90 mt-1">{cat._count.dresses} Designs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. الخزانة المنسقة (Curated Wardrobe) */}
      <section className="py-16 bg-[#FAF7F6] border-t-2 border-[#F2E4E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-extrabold text-closea-ink">Curated Wardrobe</h2>
            <p className="text-sm font-medium text-closea-inkSoft mt-1">Handpicked iconic gowns available for reservation this season.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDresses.map((dress) => (
              <DressCard
                key={dress.id}
                id={dress.id}
                title={dress.title}
                slug={dress.slug}
                brand={dress.brand}
                rentalPricePerDay={dress.rentalPricePerDay}
                originalPrice={dress.originalPrice}
                location={dress.location}
                sizeLabel={dress.size.label}
                categoryName={dress.category.name}
                imageUrl={dress.images[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'}
                isFeatured={dress.isFeatured}
              />
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Link href="/marketplace">
              <Button variant="outline" size="md" className="bg-white border-[#E8DFDD]">
                View Entire Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. المميزات (Value Proposition) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8DFDD] flex flex-col justify-between shadow-sm">
              <div>
                <ShieldCheck className="w-8 h-8 text-closea-olive mb-4" />
                <h3 className="text-xl font-extrabold text-closea-ink mb-2">Flawless Condition, Guaranteed.</h3>
                <p className="text-sm font-medium text-closea-inkSoft leading-relaxed mb-6">
                  Every garment goes through a 12-point inspection, eco-friendly dry cleaning, and professional steaming by our partner ateliers before it reaches you.
                </p>
              </div>
              <ul className="space-y-3">
                {['Zero stains guarantee', 'Authenticity verified', 'Backup dress protection'].map((item, i) => (
                  <li key={i} className="flex items-center text-sm font-bold text-closea-ink">
                    <div className="w-1.5 h-1.5 rounded-full bg-closea-rosewood mr-2.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-closea-ink text-white flex flex-col justify-between shadow-sm">
              <div>
                <Sparkles className="w-8 h-8 text-closea-blush mb-4" />
                <h3 className="text-xl font-extrabold mb-2">Turn Your Wardrobe into Income.</h3>
                <p className="text-sm font-medium text-gray-300 leading-relaxed mb-6">
                  Your luxury dresses shouldn't sit in the dark. List them on Closéa to earn passive income. We handle the logistics, dry cleaning, and secure payouts.
                </p>
              </div>
              <div>
                <Link href="/dashboard/owner?action=new-listing">
                  <Button variant="primary" className="w-full sm:w-auto">Start Earning Today</Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}