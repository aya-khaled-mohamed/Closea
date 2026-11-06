'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DressCard } from '@/components/marketplace/DressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#3D322E]">Loading Dress Discovery Collection...</p>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters state initialized from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [size, setSize] = useState(searchParams.get('size') || 'all');
  const [color, setColor] = useState(searchParams.get('color') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 1000
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Data states
  const [dresses, setDresses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Available colors based on brand standards
  const availableColors = [
    'Soft Blush',
    'Dusty Rose',
    'Nude Pink',
    'Pure White',
    'Soft Sage Green',
    'Deep Olive',
    'Dark Warm Grey',
  ];

  // Fetch filter metadata (categories & sizes)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, sizeRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/sizes'),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
        if (sizeRes.ok) {
          const sizeData = await sizeRes.json();
          setSizes(sizeData.sizes || []);
        }
      } catch (e) {
        console.error('Error loading filter options:', e);
      }
    }
    loadMeta();
  }, []);

  // Fetch dresses from API with current filters
  const fetchDresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'all') params.set('category', category);
      if (size && size !== 'all') params.set('size', size);
      if (color && color !== 'all') params.set('color', color);
      if (maxPrice < 1000) params.set('maxPrice', maxPrice.toString());
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/dresses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDresses(data.dresses || []);
      }
    } catch (e) {
      console.error('Failed to fetch dresses:', e);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, size, color, maxPrice, sort]);

  useEffect(() => {
    fetchDresses();
  }, [fetchDresses]);

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setSize('all');
    setColor('all');
    setMaxPrice(1000);
    setSort('newest');
  };

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (size !== 'all' ? 1 : 0) +
    (color !== 'all' ? 1 : 0) +
    (maxPrice < 1000 ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Header */}
      <div className="bg-[#FAF7F6] border-b border-closea-blush py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#8B5E56]">
            Peer-to-Peer Haute Curation
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-closea-grey mt-2">
            The Dress Discovery Collection
          </h1>
          <p className="text-sm text-[#3D322E] mt-2 max-w-2xl font-light">
            Every garment in our archive is maintained by certified partner ateliers. Explore red carpet gowns, cocktail dresses, and bridal guest statements.
          </p>

          {/* Quick Category Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-6 pb-2 no-scrollbar">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
                category === 'all'
                  ? 'bg-closea-rose text-white shadow-sm'
                  : 'bg-white border border-[#E8DFDD] text-closea-grey hover:border-closea-rose'
              }`}
            >
              All Occasions
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
                  category === c.slug
                    ? 'bg-closea-rose text-white shadow-sm'
                    : 'bg-white border border-[#E8DFDD] text-closea-grey hover:border-closea-rose'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Utility Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#F2E4E1]">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-closea-grey-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, dress name, or occasion..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose focus:ring-2 focus:ring-closea-blush"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-closea-grey-muted hover:text-closea-grey"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right controls: Sort and Filter toggle */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-closea-nude text-xs font-semibold text-[#2D2522] hover:bg-closea-blush/40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B5E56]" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[#3D322E] hidden sm:inline-block">Sort by:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2 rounded-full border border-[#E8DFDD] text-xs text-closea-grey bg-white focus:outline-none focus:border-closea-rose font-medium cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-closea-grey-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Desktop Filter Sidebar */}
          <div
            className={`lg:block ${
              isMobileFiltersOpen
                ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block'
                : 'hidden'
            } lg:relative lg:p-0 lg:z-auto space-y-8`}
          >
            {isMobileFiltersOpen && (
              <div className="flex items-center justify-between pb-4 border-b border-closea-blush lg:hidden">
                <h3 className="font-editorial text-2xl">Filters</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded-full text-closea-grey"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-closea-grey">Filter Archive</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#8B5E56] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset all
                </button>
              )}
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#2D2522]">Max Rental Rate</span>
                <span className="font-semibold text-[#8B5E56]">EGP {maxPrice} / day</span>
              </div>
              <input
                type="range"
                min="40"
                max="1000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-closea-rose cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#3D322E]">
                <span>EGP40</span>
                <span>EGP1000+</span>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-[#2D2522] uppercase tracking-wider">
                Dress Size
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['all', 'XS', 'S', 'M', 'L', 'XL'].map((sizeOption) => {
                  const isActive = size === sizeOption;
                  const label = sizeOption === 'all' ? 'All Sizes' : sizeOption;
                  return (
                    <button
                      key={sizeOption}
                      onClick={() => setSize(sizeOption)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                        isActive
                          ? 'bg-closea-rose text-white'
                          : 'bg-[#FAF7F6] text-closea-grey hover:bg-closea-blush/60'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-[#2D2522]">Color Palette</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setColor('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    color === 'all'
                      ? 'bg-closea-grey text-white'
                      : 'bg-white border border-[#E8DFDD] text-closea-grey hover:border-closea-grey'
                  }`}
                >
                  All Colors
                </button>
                {availableColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      color === c
                        ? 'bg-closea-rose text-white border-closea-rose'
                        : 'bg-white border border-[#E8DFDD] text-closea-grey hover:border-closea-rose'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust & Care assurance */}
            <div className="p-4 rounded-xl bg-[#EBF1E9] border border-closea-sage/40 space-y-2">
              <p className="text-xs font-semibold text-closea-olive">Closéa Atelier Certified</p>
              <p className="text-[11px] text-[#3D322E] leading-relaxed">
                All garments are professionally eco-cleaned and steamed by partner ateliers between reservations.
              </p>
            </div>

            {isMobileFiltersOpen && (
              <div className="pt-4 lg:hidden">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  Apply Filters ({dresses.length} Dresses)
                </Button>
              </div>
            )}
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-[#FAF7F6] rounded-2xl animate-pulse border border-closea-blush/40"
                  />
                ))}
              </div>
            ) : dresses.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-[#3D322E]">
                  <span>
                    Showing <strong className="text-closea-grey">{dresses.length}</strong> designer garments
                  </span>
                  <Badge variant="sage" dot>All verified ready for reservation</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dresses.map((dress) => (
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
                      isFeatured={dress.isFeatured}
                      isWishlisted={dress.isWishlisted}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="py-20 text-center space-y-4 bg-[#FAF7F6] rounded-3xl border border-closea-blush/80 p-8">
                <div className="w-12 h-12 rounded-full bg-closea-blush text-[#8B5E56] mx-auto flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-editorial text-2xl font-normal text-closea-grey">No Dresses Match Your Search</h3>
                <p className="text-xs text-[#3D322E] max-w-md mx-auto">
                  Try adjusting your filters, price range, or searching for broader terms like &quot;Silk&quot;, &quot;Gala&quot;, or &quot;Zimmermann&quot;.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}