'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Menu,
  X,
  LogOut,
  Sparkles,
  ShoppingBag,
  Scissors,
  PlusCircle,
  ArrowRightLeft,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER' | 'ATELIER' | 'ADMIN';
  avatarUrl?: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setWishlistCount(data.wishlistCount || 0);
        } else {
          setCurrentUser(null);
          setWishlistCount(0);
        }
      } catch {
        setCurrentUser(null);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Trending Now', href: '/marketplace?trending=true' },
    { label: 'How Closéa Works', href: '/#how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            <Logo size="md" />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-bold tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'text-closea-ink'
                      : 'text-closea-inkSoft hover:text-closea-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-5">
            {/* List Your Dress CTA - Updated to use router.push */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/owner?action=new-listing')}
              className="font-bold border-closea-rosewood text-closea-rosewood hover:bg-closea-blush/40"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              List Your Dress
            </Button>

            <Link
              href="/dashboard/customer?tab=wishlist"
              className="relative p-2 text-closea-inkSoft hover:text-closea-rosewood transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[2]" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-closea-rosewood text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
                >
                  {currentUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-closea-blush text-closea-ink flex items-center justify-center font-bold text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-bold text-closea-ink hidden lg:inline-block max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-closea-ink truncate">{currentUser.name}</p>
                      <p className="text-xs font-medium text-closea-inkSoft truncate mb-2">{currentUser.email}</p>
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-closea-inkSoft">
                        Role: {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'OWNER' ? (
                        <>
                          <Link href="/dashboard/owner" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-closea-ink hover:bg-gray-50 transition-colors">
                            <Sparkles className="w-4 h-4 text-closea-rosewood" /> Dress Owner Studio
                          </Link>
                          <Link href="/dashboard/customer" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-closea-inkSoft hover:bg-gray-50 transition-colors">
                            <ArrowRightLeft className="w-4 h-4" /> Switch to Renting
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/dashboard/customer" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-closea-ink hover:bg-gray-50 transition-colors">
                            <ShoppingBag className="w-4 h-4 text-closea-rosewood" /> My Bookings & Wishlist
                          </Link>
                          <Link href="/dashboard/owner" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-closea-inkSoft hover:bg-gray-50 transition-colors">
                            <ArrowRightLeft className="w-4 h-4" /> Switch to Lending
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'ATELIER' && (
                        <Link href="/atelier" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-closea-olive hover:bg-closea-sage/20 transition-colors">
                          <Scissors className="w-4 h-4" /> Partner Atelier Portal
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={() => { setIsUserMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-bold">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Join Closéa</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center space-x-2">
            <Link href="/dashboard/customer?tab=wishlist" className="p-2 text-closea-inkSoft">
              <Heart className="w-5 h-5" />
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-closea-ink hover:bg-gray-50 rounded-lg">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-4 pb-6 space-y-4 shadow-xl absolute w-full">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-bold text-closea-ink hover:bg-gray-50">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
            <Button variant="outline" size="md" className="w-full justify-center" onClick={() => { setIsMobileMenuOpen(false); router.push('/dashboard/owner?action=new-listing'); }}>
              <PlusCircle className="w-4 h-4 mr-2" /> List Your Dress
            </Button>

            {currentUser ? (
              <>
                 {currentUser.role === 'OWNER' ? (
                    <>
                      <Link href="/dashboard/owner" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-closea-ink font-bold hover:bg-gray-50 rounded-lg flex items-center justify-between">
                        <span>Owner Studio</span><Sparkles className="w-4 h-4 text-closea-rosewood" />
                      </Link>
                      <Link href="/dashboard/customer" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-closea-inkSoft font-medium hover:bg-gray-50 rounded-lg flex items-center justify-between">
                        <span>Switch to Renting</span><ArrowRightLeft className="w-4 h-4" />
                      </Link>
                    </>
                 ) : (
                    <>
                      <Link href="/dashboard/customer" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-closea-ink font-bold hover:bg-gray-50 rounded-lg flex items-center justify-between">
                        <span>Customer Dashboard</span><ShoppingBag className="w-4 h-4 text-closea-rosewood" />
                      </Link>
                      <Link href="/dashboard/owner" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-closea-inkSoft font-medium hover:bg-gray-50 rounded-lg flex items-center justify-between">
                        <span>Switch to Lending</span><ArrowRightLeft className="w-4 h-4" />
                      </Link>
                    </>
                 )}
                
                {currentUser.role === 'ATELIER' && (
                  <Link href="/atelier" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm text-closea-olive font-bold bg-closea-sage/10 rounded-lg flex items-center justify-between mt-2">
                    <span>Partner Atelier Portal</span><Scissors className="w-4 h-4" />
                  </Link>
                )}

                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-lg flex items-center justify-between">
                  <span>Sign Out</span><LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">Join Closéa</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}