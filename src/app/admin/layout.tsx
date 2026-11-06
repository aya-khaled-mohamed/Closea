import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export const metadata = {
  title: 'Closéa Admin — Platform Operations & Governance',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAF7F6]">
      {children}
    </div>
  );
}
