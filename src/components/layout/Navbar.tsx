'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Sparkles,
  ShoppingBag,
  Scissors,
  PlusCircle,
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

  // Fetch session & wishlist
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
    { label: 'Collections', href: '/marketplace?featured=true' },
    { label: 'How Closéa Works', href: '/#how-it-works' },
    { label: 'Partner Ateliers', href: '/#ateliers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F2E4E1] transition-all">
      {/* Top editorial announcement bar */}
      <div className="bg-[#FAF4F3] border-b border-[#F2E4E1]/80 py-1.5 px-4 text-center text-xs tracking-wider text-closea-grey">
        <span>Complimentary Atelier fitting and eco-cleaning included on every booking</span>
        <span className="mx-2 text-[#8B5E56]">•</span>
        <span className="font-medium text-[#8B5E56]">Circular Luxury in Qena</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors duration-200 py-1 border-b-2 ${
                    isActive
                      ? 'border-closea-rose text-closea-grey font-medium'
                      : 'border-transparent text-[#3D322E] hover:text-closea-grey hover:border-closea-nude'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-5">
            {/* List Your Dress CTA */}
            <Link href="/dashboard/owner?action=new-listing">
              <Button variant="outline" size="sm" className="font-medium border-closea-rose text-closea-grey hover:bg-closea-blush/40">
                <PlusCircle className="w-3.5 h-3.5 text-[#8B5E56]" />
                List Your Dress
              </Button>
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/dashboard/customer?tab=wishlist"
              className="relative p-2 text-closea-grey hover:text-[#8B5E56] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.6]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-closea-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-closea-blush/50 transition-colors focus:outline-none"
                >
                  {currentUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-closea-nude"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-medium text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[#2D2522] hidden lg:inline-block max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-closea-blush py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-closea-blush">
                      <p className="text-xs font-semibold text-closea-grey truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-[#3D322E] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-closea-blush text-closea-grey">
                        Role: {currentUser.role}
                      </span>
                    </div>

                    <Link
                      href="/dashboard/customer"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-closea-grey hover:bg-closea-blush/40 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#8B5E56]" />
                      Customer Dashboard & Bookings
                    </Link>

                    <Link
                      href="/dashboard/owner"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-closea-grey hover:bg-closea-blush/40 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8B5E56]" />
                      Dress Owner Studio & Earnings
                    </Link>

                    {currentUser.role === 'ATELIER' && (
                      <Link
                        href="/atelier"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-closea-olive font-medium hover:bg-closea-sage/10 transition-colors"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        Partner Atelier Portal
                      </Link>
                    )}

                    <div className="border-t border-closea-blush my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Join Closéa
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <Link href="/dashboard/customer?tab=wishlist" className="p-2 text-closea-grey">
              <Heart className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-closea-grey hover:bg-closea-blush/50 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-closea-blush bg-white px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-[#2D2522] hover:bg-closea-blush/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-closea-blush flex flex-col space-y-2">
            <Link
              href="/dashboard/owner?action=new-listing"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button variant="outline" size="sm" className="w-full justify-center">
                <PlusCircle className="w-4 h-4 mr-2 text-[#8B5E56]" />
                List Your Dress
              </Button>
            </Link>

            {currentUser ? (
              <>
                <Link
                  href="/dashboard/customer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-closea-grey font-medium hover:bg-closea-blush/40 rounded-lg flex items-center justify-between"
                >
                  <span>Customer Dashboard</span>
                  <ShoppingBag className="w-4 h-4 text-[#8B5E56]" />
                </Link>
                <Link
                  href="/dashboard/owner"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm text-closea-grey font-medium hover:bg-closea-blush/40 rounded-lg flex items-center justify-between"
                >
                  <span>Dress Owner Studio</span>
                  <Sparkles className="w-4 h-4 text-[#8B5E56]" />
                </Link>
                {currentUser.role === 'ATELIER' && (
                  <Link
                    href="/atelier"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-closea-olive font-medium bg-closea-sage/10 rounded-lg flex items-center justify-between"
                  >
                    <span>Partner Atelier Portal</span>
                    <Scissors className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg flex items-center justify-between"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Join Closéa
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
