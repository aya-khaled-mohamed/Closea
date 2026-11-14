'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Flame } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface DressCardProps {
  id: string;
  title: string;
  slug: string;
  brand: string;
  rentalPricePerDay: number;
  originalPrice?: number | null;
  location: string;
  sizeLabel: string;
  categoryName: string;
  imageUrl: string;
  isFeatured?: boolean;
  isTrending?: boolean; // الخاصية الجديدة
  isWishlisted?: boolean;
  onWishlistToggle?: (dressId: string, newState: boolean) => void;
}

export function DressCard({
  id,
  title,
  slug,
  brand,
  rentalPricePerDay,
  location,
  sizeLabel,
  imageUrl,
  isFeatured = false,
  isTrending = false,
  isWishlisted: initialWishlisted = false,
  onWishlistToggle,
}: DressCardProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingWishlist(true);
    const nextState = !wishlisted;
    setWishlisted(nextState);

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dressId: id }),
      });
      if (!res.ok) setWishlisted(!nextState);
      else onWishlistToggle?.(id, nextState);
    } catch {
      setWishlisted(!nextState);
    } finally {
      setLoadingWishlist(false);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      
      <Link href={`/dresses/${slug}`} className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F5F5]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        <button
          onClick={handleWishlistClick}
          disabled={loadingWishlist}
          className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-closea-rosewood text-closea-rosewood' : 'text-closea-inkSoft'
            }`}
          />
        </button>

        {/* عرض البادج حسب النوع */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isTrending ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-closea-rosewood text-white shadow-sm">
              <Flame className="w-3 h-3 fill-white" /> Trending
            </span>
          ) : isFeatured ? (
            <span className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-closea-ink text-white shadow-sm">
              Editor's Pick
            </span>
          ) : null}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow bg-white">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-closea-inkSoft truncate block mb-0.5">
              {brand}
            </span>
            <Link href={`/dresses/${slug}`}>
              <h3 className="text-sm font-bold text-closea-ink truncate group-hover:text-closea-rosewood transition-colors">
                {title}
              </h3>
            </Link>
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-extrabold text-closea-ink">
            {formatCurrency(rentalPricePerDay)}
          </span>
          <span className="text-[11px] font-medium text-closea-inkSoft">/ day</span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] font-medium text-closea-inkSoft flex items-center justify-between">
          <span className="truncate pr-2">Size: {sizeLabel}</span>
          <span className="truncate">{location.split(',')[0]}</span>
        </div>
      </div>
    </div>
  );
}