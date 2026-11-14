'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
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
  isWishlisted?: boolean;
  onWishlistToggle?: (dressId: string, newState: boolean) => void;
}

export function DressCard({
  id,
  title,
  slug,
  brand,
  rentalPricePerDay,
  originalPrice,
  location,
  sizeLabel,
  categoryName,
  imageUrl,
  isFeatured = false,
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
      if (!res.ok) {
        // revert on failure
        setWishlisted(!nextState);
      } else {
        onWishlistToggle?.(id, nextState);
      }
    } catch {
      setWishlisted(!nextState);
    } finally {
      setLoadingWishlist(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#F2E4E1] transition-all duration-300 hover:shadow-card hover:-translate-y-1">
      {/* Image Container with Editorial Aspect Ratio */}
      <Link href={`/dresses/${slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-closea-blush">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay for Editorial Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isFeatured && (
            <Badge variant="rose" className="shadow-sm">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Featured
            </Badge>
          )}
          <Badge variant="sage" dot>
            Available to Rent
          </Badge>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={loadingWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-closea-grey shadow-sm hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted
                ? 'fill-closea-rose text-[#8B5E56]'
                : 'text-closea-grey hover:text-[#8B5E56]'
            }`}
          />
        </button>

        {/* Subtle Category Pill on Bottom of Image */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 backdrop-blur-md text-closea-grey shadow-sm">
            {categoryName}
          </span>
        </div>
      </Link>

      {/* Dress Information */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-[#3D322E] mb-1">
            <span className="font-semibold uppercase tracking-wider text-closea-grey">{brand}</span>
            <span className="px-2 py-0.5 rounded bg-closea-blush/60 text-closea-grey font-medium text-[11px]">
              {sizeLabel}
            </span>
          </div>

          <Link href={`/dresses/${slug}`}>
            <h3 className="font-editorial text-lg font-normal text-closea-grey line-clamp-1 group-hover:text-[#8B5E56] transition-colors">
              {title}
            </h3>
          </Link>
        </div>

        {/* Pricing and Location */}
        <div className="pt-2 border-t border-[#F2E4E1] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-semibold text-closea-grey">
                {formatCurrency(rentalPricePerDay)}
              </span>
              <span className="text-xs text-[#3D322E]">/ day</span>
            </div>
            {originalPrice && (
              <span className="text-[11px] text-closea-grey-muted line-through">
                Retail {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center text-xs text-[#3D322E]">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#8B5E56]" />
            <span className="truncate max-w-[110px]">{location.split(',')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
