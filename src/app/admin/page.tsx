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
  Scissors,
  Star,
} from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  // Fetch featured approved dresses
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

  // Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    take: 4,
    include: {
      _count: { select: { dresses: { where: { status: 'APPROVED' } } } },
    },
  });

  return (
    <div className="flex flex-col bg-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-white pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-closea-rose animate-pulse" />
                <span className="text-[11px] uppercase tracking-widest font-bold text-closea-ink">
                  Circular Haute Couture
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-closea-ink tracking-tight leading-[1.1]">
                Wear the dress <br />
                of your dreams.
              </h1>

              <p className="text-base sm:text-lg text-closea-inkSoft max-w-lg font-medium leading-relaxed">
                Cherish the memory, not the clutter. Closéa connects women who own exceptional designer dresses with women seeking unforgettable looks.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link href="/marketplace" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto shadow-md">
                    Explore The Collection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/owner?action=new-listing" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white border-gray-200">
                    Monetize Your Closet
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators - FIXED */}
              <div className="pt-8 mt-2 border-t border-gray-100 flex items-start justify-between gap-4 max-w-md">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-closea-ink whitespace-nowrap">
                    10k+
                  </p>
                  <p className="text-[10px] font-bold text-closea-inkSoft uppercase tracking-wider mt-1">
                    Happy Renters
                  </p>
                </div>
                
                <div className="w-px h-10 bg-gray-200 flex-shrink-0 mt-1" />
                
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-closea-ink whitespace-nowrap">
                    500+
                  </p>
                  <p className="text-[10px] font-bold text-closea-inkSoft uppercase tracking-wider mt-1">
                    Dresses
                  </p>
                </div>
                
                <div className="w-px h-10 bg-gray-200 flex-shrink-0 mt-1" />
                
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-closea-ink whitespace-nowrap">
                      4.9
                    </span>
                    <Star className="w-4 h-4 fill-closea-rosewood text-closea-rosewood mb-1" />
                  </div>
                  <p className="text-[10px] font-bold text-closea-inkSoft uppercase tracking-wider mt-1">
                    Rating
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Editorial Image */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80"
                  alt="Elegant Designer Dress"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>
              
              {/* Floating Badge on Image */}
              <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hidden sm:block">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-closea-blush/40 rounded-full">
                    <Scissors className="w-4 h-4 text-closea-rosewood" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-closea-ink">Atelier Certified</p>
                    <p className="text-[10px] font-medium text-closea-inkSoft">Cleaned & Fitted</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. "AS SEEN IN" / PARTNERS BAR */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold text-closea-inkSoft uppercase tracking-widest mb-4">
            Trusted by fashion lovers featured in
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-lg font-serif font-bold text-closea-ink">VOGUE</span>
            <span className="text-lg font-sans font-black tracking-tighter text-closea-ink">ELLE</span>
            <span className="text-lg font-serif italic text-closea-ink">Harper's BAZAAR</span>
            <span className="text-lg font-sans font-bold uppercase tracking-widest text-closea-ink">BAZAAR</span>
          </div>
        </div>
      </section>

      {/* 3. CURATED CATEGORIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-closea-ink">
                Shop by Occasion
              </h2>
              <p className="text-sm font-medium text-closea-inkSoft mt-1.5">
                Find the perfect silhouette for your next milestone.
              </p>
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
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
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
                  <p className="text-xs font-medium text-white/90 mt-1">
                    {cat._count.dresses} Designs
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED DRESSES */}
      <section className="py-20 bg-[#FAF7F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-closea-ink">
              Curated Wardrobe
            </h2>
            <p className="text-sm font-medium text-closea-inkSoft mt-1.5">
              Handpicked iconic gowns available for reservation this season.
            </p>
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
              <Button variant="outline" size="md" className="bg-white border-gray-200">
                View Entire Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPOSITION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            <div className="p-8 sm:p-10 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
              <div>
                <ShieldCheck className="w-8 h-8 text-closea-olive mb-5" />
                <h3 className="text-2xl font-extrabold text-closea-ink mb-3">
                  Flawless Condition, Guaranteed.
                </h3>
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

            <div className="p-8 sm:p-10 rounded-3xl bg-closea-ink text-white flex flex-col justify-between">
              <div>
                <Sparkles className="w-8 h-8 text-closea-blush mb-5" />
                <h3 className="text-2xl font-extrabold mb-3">
                  Turn Your Wardrobe into Income.
                </h3>
                <p className="text-sm font-medium text-gray-300 leading-relaxed mb-6">
                  Your luxury dresses shouldn't sit in the dark. List them on Closéa to earn passive income. We handle the logistics, dry cleaning, and secure payouts.
                </p>
              </div>
              <div>
                <Link href="/dashboard/owner?action=new-listing">
                  <Button variant="primary" className="w-full sm:w-auto">
                    Start Earning Today
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}