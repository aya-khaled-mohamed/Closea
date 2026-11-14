'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DressCard } from '@/components/marketplace/DressCard';
import { Button } from '@/components/ui/Button';
import { Search, SlidersHorizontal, X, RotateCcw, Sparkles, ChevronDown, Star, Flame } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-sm font-bold text-closea-inkSoft">Loading Collection...</p></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isTrending = searchParams.get('trending') === 'true';

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [size, setSize] = useState(searchParams.get('size') || 'all');
  const [color, setColor] = useState(searchParams.get('color') || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 1000);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [dresses, setDresses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const availableColors = ['Soft Blush', 'Dusty Rose', 'Nude Pink', 'Pure White', 'Soft Sage Green', 'Deep Olive', 'Dark Warm Grey'];

  useEffect(() => {
    async function loadMeta() {
      try {
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (e) { console.error(e); }
    }
    loadMeta();
  }, []);

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
      
      if (isTrending) params.set('trending', 'true');

      const res = await fetch(`/api/dresses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDresses(data.dresses || []);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [search, category, size, color, maxPrice, sort, isTrending]);

  useEffect(() => { fetchDresses(); }, [fetchDresses]);

  const resetFilters = () => {
    setSearch(''); setCategory('all'); setSize('all'); setColor('all'); setMaxPrice(1000); setSort('newest');
    if (isTrending) router.push('/marketplace?trending=true');
  };

  const activeFilterCount = (category !== 'all' ? 1 : 0) + (size !== 'all' ? 1 : 0) + (color !== 'all' ? 1 : 0) + (maxPrice < 1000 ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="bg-[#FAF7F6] min-h-screen pb-20">
      
      {/* Header Area */}
      <div className="bg-white pt-12 pb-8 border-b border-[#F2E4E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isTrending ? (
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-closea-rosewood text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                <Star className="w-3.5 h-3.5 fill-white" /> MOST LOVED BY THE COMMUNITY
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-closea-ink tracking-tight">
                Trending Now
              </h1>
              <p className="text-base text-closea-inkSoft mt-3 font-medium leading-relaxed">
                Explore the most-rented and sought-after pieces this season. Discover styles loved by our community and reserve your standout look before it's booked.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-closea-ink tracking-tight">
                The Dress Discovery Collection
              </h1>
              <p className="text-base text-closea-inkSoft mt-3 font-medium leading-relaxed">
                Every garment in our archive is maintained by certified partner ateliers. Explore red carpet gowns, cocktail dresses, and bridal guest statements for every occasion.
              </p>
            </div>
          )}

          {/* Quick Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-8 pb-2 no-scrollbar">
            <button
              onClick={() => { setCategory('all'); if (isTrending) router.push('/marketplace'); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                category === 'all' ? 'bg-closea-ink text-white shadow-sm' : 'bg-gray-50 text-closea-inkSoft hover:bg-gray-100 hover:text-closea-ink'
              }`}
            >
              All Occasions
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  category === c.slug ? 'bg-closea-ink text-white shadow-sm' : 'bg-gray-50 text-closea-inkSoft hover:bg-gray-100 hover:text-closea-ink'
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6">
          <div className="relative w-full md:w-[400px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, dress name..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border-0 bg-white shadow-sm text-sm text-closea-ink font-medium focus:outline-none focus:ring-2 focus:ring-closea-rosewood transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-closea-ink">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white shadow-sm text-sm font-bold text-closea-ink"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border-0 bg-white shadow-sm text-sm text-closea-ink font-bold focus:outline-none focus:ring-2 focus:ring-closea-rosewood cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-closea-ink absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pt-4">
          
          {/* Sidebar Filters */}
          <div className={`lg:block ${isMobileFiltersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block' : 'hidden'} lg:relative lg:p-0 lg:z-auto space-y-8`}>
            {isMobileFiltersOpen && (
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFDD] lg:hidden">
                <h3 className="text-xl font-bold text-closea-ink">Filters</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-50 rounded-full"><X className="w-5 h-5 text-closea-ink" /></button>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-closea-ink">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs text-closea-rosewood hover:underline inline-flex items-center gap-1 font-bold">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-closea-ink">Max Price</span>
                  <span className="text-sm font-bold text-closea-rosewood">EGP {maxPrice}</span>
                </div>
                <input type="range" min="40" max="1000" step="10" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-closea-rosewood cursor-pointer" />
              </div>

              {/* Sizes */}
              <div className="space-y-4">
                <span className="block text-sm font-bold text-closea-ink">Size</span>
                <div className="flex flex-wrap gap-2">
                  {['all', 'XS', 'S', 'M', 'L', 'XL'].map((sizeOption) => {
                    const isActive = size === sizeOption;
                    const label = sizeOption === 'all' ? 'All' : sizeOption;
                    return (
                      <button key={sizeOption} onClick={() => setSize(sizeOption)} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${isActive ? 'bg-closea-ink text-white' : 'bg-gray-50 text-closea-inkSoft hover:bg-gray-100'}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <span className="block text-sm font-bold text-closea-ink">Color</span>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setColor('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${color === 'all' ? 'bg-closea-ink text-white' : 'bg-gray-50 text-closea-inkSoft hover:bg-gray-100'}`}>All</button>
                  {availableColors.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${color === c ? 'bg-closea-ink text-white' : 'bg-gray-50 text-closea-inkSoft hover:bg-gray-100'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (<div key={i} className="aspect-[4/5] bg-white rounded-2xl shadow-sm animate-pulse" />))}
              </div>
            ) : dresses.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-closea-inkSoft">
                    Showing <strong className="text-closea-ink">{dresses.length}</strong> {isTrending ? 'trending pieces' : 'dresses'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      isTrending={isTrending} // بنبعت فلاج الترند للكارت
                      isWishlisted={dress.isWishlisted} 
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-6 bg-white rounded-3xl shadow-sm p-8">
                <div className="w-16 h-16 rounded-full bg-closea-blush text-closea-rosewood mx-auto flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-closea-ink">
                    {isTrending ? 'No Trending Pieces Yet' : 'No Dresses Found'}
                  </h3>
                  <p className="text-sm text-closea-inkSoft mt-2 max-w-md mx-auto font-medium">
                    {isTrending ? 'Check back soon for the most popular pieces of the season.' : 'Try adjusting your filters or searching for broader terms.'}
                  </p>
                </div>
                <Button variant="primary" size="md" onClick={resetFilters} className="mt-4">Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}