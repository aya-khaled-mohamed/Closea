import React from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { ShieldCheck, Sparkles, HeartHandshake, Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#FAF7F6] border-t border-closea-blush text-closea-grey pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-14 border-b border-[#E8DFDD]">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-full bg-closea-blush text-[#8B5E56] flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-closea-grey">Haute Curation</h4>
              <p className="text-xs text-[#3D322E] mt-1">
                Every dress is individually vetted for designer provenance, pristine condition, and craftsmanship.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-full bg-[#EBF1E9] text-closea-olive flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-closea-grey">Partner Ateliers</h4>
              <p className="text-xs text-[#3D322E] mt-1">
                Handcrafted fittings, eco-luxury dry cleaning, and seamless boutique handovers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-full bg-closea-blush text-[#8B5E56] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-closea-grey">Guaranteed Trust</h4>
              <p className="text-xs text-[#3D322E] mt-1">
                Identity-verified members, secure deposit escrow, and guaranteed rental protection.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-full bg-[#EBF1E9] text-closea-olive flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-closea-grey">Circular Luxury</h4>
              <p className="text-xs text-[#3D322E] mt-1">
                Extending the lifecycle of extraordinary garments while empowering women to monetize their closets.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-xs text-[#3D322E] leading-relaxed max-w-sm">
              Closéa is Qena’s premier peer-to-peer fashion rental marketplace, connecting women who own iconic couture dresses with women seeking unforgettable looks for special occasions.
            </p>
            <div className="pt-2 text-xs text-[#3D322E]">
              <span className="font-semibold text-closea-grey">Headquarters:</span> Qena, Egypt
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-closea-grey mb-4">Marketplace</h5>
            <ul className="space-y-2.5 text-xs text-[#3D322E]">
              <li>
                <Link href="/marketplace?category=gala-black-tie" className="hover:text-[#8B5E56] transition-colors">
                  Gala & Black Tie
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=cocktail-evening" className="hover:text-[#8B5E56] transition-colors">
                  Cocktail & Evening
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=bridal-rehearsal" className="hover:text-[#8B5E56] transition-colors">
                  Bridal & Rehearsal
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=summer-soiree-garden" className="hover:text-[#8B5E56] transition-colors">
                  Summer Soirée
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-[#8B5E56] transition-colors">
                  All Runway Pieces
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: How it Works */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-closea-grey mb-4">Experience</h5>
            <ul className="space-y-2.5 text-xs text-[#3D322E]">
              <li>
                <Link href="/#how-it-works" className="hover:text-[#8B5E56] transition-colors">
                  How Closéa Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard/owner?action=new-listing" className="hover:text-[#8B5E56] transition-colors">
                  List Your Wardrobe
                </Link>
              </li>
              <li>
                <Link href="/#ateliers" className="hover:text-[#8B5E56] transition-colors">
                  Certified Atelier Network
                </Link>
              </li>
              <li>
                <Link href="/#owner-benefits" className="hover:text-[#8B5E56] transition-colors">
                  Earnings & Insurance
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#8B5E56] transition-colors">
                  Member Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-closea-grey mb-4">Concierge</h5>
            <ul className="space-y-2.5 text-xs text-[#3D322E]">
              <li>
                <a href="mailto:concierge@closea.com" className="hover:text-[#8B5E56] transition-colors">
                  concierge@closea.com
                </a>
              </li>
              <li>
                <span className="text-[#3D322E]">7 Days a Week: 9am – 8pm CET</span>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#EBF1E9] text-closea-olive">
                  Atelier Dispatch Online
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E8DFDD] flex flex-col md:flex-row items-center justify-between text-xs text-[#3D322E] gap-4">
          <p>© {new Date().getFullYear()} Closéa S.A.S. All rights reserved. Peer-to-peer luxury fashion platform.</p>
          <div className="flex items-center space-x-6">
            <span>Terms of Service</span>
            <span>•</span>
            <span>Garment Care Charter</span>
            <span>•</span>
            <span>Privacy & Escrow Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
