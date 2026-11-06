'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Bell } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  adminName?: string;
}

export function AdminHeader({
  title,
  subtitle,
  adminName = 'Administrator',
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-[#E8DFDD] px-8 py-5 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="font-editorial text-2xl font-normal text-closea-grey">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#3D322E] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Badge variant="olive" dot>
          Live Database Sync
        </Badge>

        <div className="flex items-center space-x-3 pl-3 border-l border-closea-blush">
          <div className="w-8 h-8 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-bold text-xs">
            {adminName.charAt(0)}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-closea-grey">{adminName}</p>
            <p className="text-[10px] text-[#8B5E56]">Platform Governance</p>
          </div>
        </div>
      </div>
    </header>
  );
}
