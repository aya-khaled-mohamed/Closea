import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DressCard } from '@/components/marketplace/DressCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scissors,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Sparkle,
  Star,
} from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering for fresh listings

export default async function HomePage() {
  // Fetch featured approved dresses
  const featuredDresses = await prisma.dress.findMany({
    where: { status: 'APPROVED', isFeatured: true },
    take: 6,
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
    include: {
      _count: { select: { dresses: { where: { status: 'APPROVED' } } } },
    },
  });

  // Fetch partner ateliers
  const ateliers = await prisma.atelier.findMany({
    where: { isActive: true },
    take: 3,
  });

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION: Editorial High Fashion */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-[#FAF7F6]">
        {/* Soft atmospheric background shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-closea-blush/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-[#EBF1E9]/50 blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8DFDD] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-closea-rose animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[#2D2522]">
                Circular Haute Couture • Qena
              </span>
            </div>

            <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-normal text-closea-grey tracking-tight leading-[1.08]">
              Wear the dress of your dreams.{' '}
              <span className="italic font-light text-[#8B5E56] block mt-1">
                Cherish the memory, not the clutter.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#3D322E] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Closéa connects women who own exceptional designer dresses with women seeking unforgettable looks for life’s grandest occasions. Fully supported by certified partner ateliers.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="w-full sm:w-auto shadow-card">
                  Explore The Collection
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/dashboard/owner?action=new-listing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Monetize Your Closet
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 border-t border-[#E8DFDD]/80 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="font-editorial text-2xl lg:text-3xl font-semibold text-[#2D2522]">EGP 450+</p>
                <p className="text-[11px] uppercase tracking-wider text-[#3D322E] mt-0.5">Avg. Retail Value</p>
              </div>
              <div>
                <p className="font-editorial text-2xl lg:text-3xl font-medium text-[#8B5E56]">100%</p>
                <p className="text-[11px] uppercase tracking-wider text-[#3D322E] mt-0.5">Atelier Inspected</p>
              </div>
              <div>
                <p className="font-editorial text-2xl lg:text-3xl font-medium text-closea-olive">Qena</p>
                <p className="text-[11px] uppercase tracking-wider text-[#3D322E] mt-0.5">Boutique Pickup</p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Hero Imagery Carousel/Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Primary Hero Image */}
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-card border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85"
                  alt="Closéa Couture Gala Dress"
                  fill
                  priority
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[11px] tracking-widest uppercase font-medium bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                    Gala & Opera Premiere
                  </span>
                  <p className="font-editorial text-xl font-normal mt-2">Jacquemus Aurelia Column Gown</p>
                  <p className="text-xs text-white/90">Rent for EGP85 / day • Retail EGP1,950</p>
                </div>
              </div>

              {/* Floating Atelier Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-modal border border-closea-blush max-w-[220px] hidden sm:block">
                <div className="flex items-center space-x-2 text-xs font-semibold text-closea-olive">
                  <Scissors className="w-4 h-4 text-closea-olive" />
                  <span>Partner Atelier Care</span>
                </div>
                <p className="text-[11px] text-[#3D322E] mt-1">
                  Eco-steamed, hand-pressed, and fitted before every rental.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURATED CATEGORIES */}
      <section className="py-20 bg-white border-b border-closea-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8B5E56]">The Collections</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-closea-grey mt-2">
              Curated for Life’s Most Beautiful Occasions
            </h2>
            <p className="text-sm text-[#3D322E] mt-3">
              Explore timeless silhouettes tailored for red carpets, summer weddings, and elegant soirees.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/marketplace?category=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300"
              >
                <Image
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-editorial text-xl font-normal leading-snug">{cat.name}</p>
                  <p className="text-xs text-white/80 mt-1">
                    {cat._count.dresses} {cat._count.dresses === 1 ? 'Design' : 'Designs'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/marketplace">
              <Button variant="ghost" className="text-xs tracking-wider uppercase font-semibold">
                Browse All Categories
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DRESSES (Live from database) */}
      <section className="py-20 bg-[#FAF7F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8B5E56]">Couture Highlights</span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-closea-grey mt-1">
                Featured Wardrobe Pieces
              </h2>
              <p className="text-sm text-[#3D322E] mt-2 max-w-xl">
                Handpicked iconic gowns and cocktail dresses available for reservation this season.
              </p>
            </div>
            <Link href="/marketplace" className="mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                View Entire Catalog
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* 4. HOW CLOSÉA WORKS */}
      <section id="how-it-works" className="py-24 bg-white border-b border-closea-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8B5E56]">Effortless Elegance</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-closea-grey mt-2">
              How Closéa Works
            </h2>
            <p className="text-sm text-[#3D322E] mt-3">
              Four simple steps from runway discovery to memorable celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF7F6] border border-closea-blush/60">
              <div className="w-12 h-12 rounded-full bg-closea-blush text-[#8B5E56] flex items-center justify-center font-editorial text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-editorial text-xl font-normal text-closea-grey mb-2">Discover & Reserve</h3>
              <p className="text-xs text-[#3D322E] leading-relaxed">
                Filter by occasion, size, and date. Submit your rental request with zero double-booking risk.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF7F6] border border-closea-blush/60">
              <div className="w-12 h-12 rounded-full bg-closea-blush text-[#8B5E56] flex items-center justify-center font-editorial text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-editorial text-xl font-normal text-closea-grey mb-2">Owner Confirms</h3>
              <p className="text-xs text-[#3D322E] leading-relaxed">
                The dress owner accepts your booking. Funds and deposit are secured safely in escrow.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#EBF1E9] border border-closea-sage/40">
              <div className="w-12 h-12 rounded-full bg-white text-closea-olive flex items-center justify-center font-editorial text-2xl font-bold mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-editorial text-xl font-normal text-closea-grey mb-2">Atelier Perfection</h3>
              <p className="text-xs text-[#3D322E] leading-relaxed">
                Our certified partner atelier prepares, steams, and verifies the fit. Pickup or courier delivery.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF7F6] border border-closea-blush/60">
              <div className="w-12 h-12 rounded-full bg-closea-blush text-[#8B5E56] flex items-center justify-center font-editorial text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="font-editorial text-xl font-normal text-closea-grey mb-2">Celebrate & Return</h3>
              <p className="text-xs text-[#3D322E] leading-relaxed">
                Shine at your occasion. Simply drop the dress off at the atelier; we handle eco-cleaning and deposit release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL VALUE PROPOSITIONS: For Renters & For Owners */}
      <section id="owner-benefits" className="py-24 bg-[#FAF7F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* For Renters */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E8DFDD] shadow-soft flex flex-col justify-between">
              <div className="space-y-6">
                <Badge variant="rose">For The Renter</Badge>
                <h3 className="font-editorial text-3xl sm:text-4xl font-normal text-closea-grey">
                  Runway Couture Without the Thousand-Pound Price Tag
                </h3>
                <p className="text-xs sm:text-sm text-[#3D322E] leading-relaxed">
                  Experience the exhilarating confidence of wearing museum-grade couture for milestone celebrations, without committing to garments that linger forgotten in a closet.
                </p>

                <ul className="space-y-3.5 pt-2">
                  {[
                    'Access iconic designer labels from Jacquemus, Khaite, and Zimmermann at 5-10% of retail price',
                    'Complimentary atelier fitting and eco-luxury dry cleaning included on every booking',
                    'Zero guilt of fashion overconsumption — participate in a refined circular luxury movement',
                    'Guaranteed authenticity and flawless condition verified by certified ateliers',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start text-xs sm:text-sm text-closea-grey">
                      <CheckCircle2 className="w-4 h-4 text-[#8B5E56] mr-2.5 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-6 border-t border-closea-blush">
                <Link href="/marketplace">
                  <Button variant="primary" className="w-full sm:w-auto">
                    Browse All Dresses
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Dress Owners */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E8DFDD] shadow-soft flex flex-col justify-between">
              <div className="space-y-6">
                <Badge variant="olive">For The Dress Owner</Badge>
                <h3 className="font-editorial text-3xl sm:text-4xl font-normal text-closea-grey">
                  Turn Your Investment Wardrobe Into Effortless Passive Income
                </h3>
                <p className="text-xs sm:text-sm text-[#3D322E] leading-relaxed">
                  Your luxury gowns shouldn’t spend 360 days a year in dark garment bags. Monetize your collection with complete peace of mind, insured custody, and zero dry cleaning hassle.
                </p>

                <ul className="space-y-3.5 pt-2">
                  {[
                    'Earn up to EGP400 – EGP1,200 per dress each season while retaining full ownership',
                    'Partner ateliers handle all dry cleaning, minor button checks, and handovers for you',
                    'Transparent 75% owner payout automatically disbursed after every completed rental',
                    'Identity-verified renters, full security deposit escrow, and comprehensive platform protection',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start text-xs sm:text-sm text-closea-grey">
                      <CheckCircle2 className="w-4 h-4 text-closea-olive mr-2.5 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-6 border-t border-closea-blush">
                <Link href="/dashboard/owner?action=new-listing">
                  <Button variant="dark" className="w-full sm:w-auto">
                    Start Monetizing Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PARTNER ATELIER SHOWCASE */}
      <section id="ateliers" className="py-20 bg-white border-b border-closea-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-semibold text-closea-olive">Qenaian Craftsmanship</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-closea-grey mt-2">
              Our Certified Partner Ateliers
            </h2>
            <p className="text-sm text-[#3D322E] mt-3">
              Closéa operates in tandem with master tailors and eco-cleaning boutiques across Qena to guarantee garment safety and fit perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ateliers.map((atelier) => (
              <div
                key={atelier.id}
                className="p-8 rounded-2xl bg-[#FAF7F6] border border-closea-blush flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="sage" dot>Certified Closéa Partner</Badge>
                    <span className="text-xs text-[#3D322E]">{atelier.city} {atelier.postalCode}</span>
                  </div>
                  <h3 className="font-editorial text-2xl font-normal text-closea-grey">{atelier.name}</h3>
                  <p className="text-xs text-[#3D322E] mt-1">{atelier.address}</p>

                  <div className="mt-6 space-y-2 text-xs text-closea-grey">
                    <p className="flex items-center">
                      <Scissors className="w-3.5 h-3.5 text-closea-olive mr-2" />
                      Bespoke steam fitting and delicate alterations
                    </p>
                    <p className="flex items-center">
                      <Sparkle className="w-3.5 h-3.5 text-[#8B5E56] mr-2" />
                      Silks and delicate fabrics dry cleaned with eco-solvent care
                    </p>
                    <p className="flex items-center">
                      <HeartHandshake className="w-3.5 h-3.5 text-closea-olive mr-2" />
                      Boutique pickup lounge with private changing boudoirs
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8DFDD] text-xs text-[#3D322E]">
                  <span>Contact: {atelier.contactPerson}</span>
                  <span className="mx-2">•</span>
                  <span>{atelier.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. AUTHENTIC TESTIMONIALS */}
      <section className="py-20 bg-[#FAF7F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#8B5E56]">The Closéa Community</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-closea-grey mt-2">
              Stories from Qena
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-[#8B5E56]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-closea-grey leading-relaxed italic">
                  “The Jacquemus column gown was divine. The atelier in Saint-Honoré had it steamed and waiting for me in a gorgeous dust bag. I received compliments the entire evening at the Opera Garnier!”
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-closea-blush flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-medium text-xs">
                  C
                </div>
                <div>
                  <p className="text-xs font-semibold text-closea-grey">Camille Dupont</p>
                  <p className="text-[11px] text-[#3D322E]">Rented for Gala Opera</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-[#8B5E56]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-closea-grey leading-relaxed italic">
                  “I listed three couture dresses that I wore only once to friends’ weddings. In four months, they’ve generated over EGP1,400. Closéa’s partner ateliers handle all the dry cleaning. It’s seamless.”
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-closea-blush flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-medium text-xs">
                  S
                </div>
                <div>
                  <p className="text-xs font-semibold text-closea-grey">Sophie Laurent</p>
                  <p className="text-[11px] text-[#3D322E]">Dress Owner & Curator</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E8DFDD] shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-[#8B5E56]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-closea-grey leading-relaxed italic">
                  “The Zimmermann metallic dress caught every spotlight at our anniversary soiree. No dry cleaning stress afterwards, just return to the Marais atelier. Pure luxury.”
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-closea-blush flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-medium text-xs">
                  I
                </div>
                <div>
                  <p className="text-xs font-semibold text-closea-grey">Isabella Rossi</p>
                  <p className="text-[11px] text-[#3D322E]">Rented for Anniversary Dinner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMMUNITY & NEWSLETTER SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="rose">Closéa Circle</Badge>
          <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-closea-grey">
            Enter the Private World of Closéa
          </h2>
          <p className="text-sm text-[#3D322E] max-w-xl mx-auto">
            Receive private invitations to new archive drops, styling guides, and seasonal atelier trunk shows in Qena.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              placeholder="Your email address"
              className="px-5 py-3 rounded-full border border-[#E8DFDD] text-xs text-closea-grey flex-grow focus:outline-none focus:border-closea-rose focus:ring-2 focus:ring-closea-blush"
              required
            />
            <Button variant="primary" size="md" type="submit">
              Join The Circle
            </Button>
          </form>
          <p className="text-[11px] text-[#3D322E]">
            We respect your privacy. Strictly editorial updates; unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
