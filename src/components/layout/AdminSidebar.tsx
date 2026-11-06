'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  ShoppingBag,
  Scissors,
  DollarSign,
  Sliders,
  FileText,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Dresses & Curations', href: '/admin/dresses', icon: Sparkles },
    { label: 'Bookings & Escrow', href: '/admin/bookings', icon: ShoppingBag },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Partner Ateliers', href: '/admin/ateliers', icon: Scissors },
    { label: 'Financials & Split', href: '/admin/finances', icon: DollarSign },
    { label: 'Platform Content', href: '/admin/content', icon: Sliders },
    { label: 'Audit Activity Log', href: '/admin/logs', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E8DFDD] flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Admin Brand Header */}
        <div className="p-6 border-b border-closea-blush">
          <Logo size="md" href="/admin" />
          <div className="mt-2 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-closea-olive" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-closea-grey">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-closea-blush text-closea-grey font-semibold shadow-sm'
                    : 'text-[#3D322E] hover:bg-[#FAF7F6] hover:text-closea-grey'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#8B5E56]' : 'text-closea-grey-muted'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-closea-blush space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#3D322E] hover:bg-[#FAF7F6] hover:text-closea-grey transition-colors"
        >
          <span>View Public Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
}
