'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { FileText, ShieldAlert, CheckCircle2, User, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE_LISTING':
        return <Badge variant="sage">Approved Listing</Badge>;
      case 'REJECT_LISTING':
        return <Badge variant="grey">Rejected Listing</Badge>;
      case 'SUSPEND_USER':
        return <Badge variant="grey">Suspended User</Badge>;
      case 'REACTIVATE_USER':
        return <Badge variant="sage">Reactivated User</Badge>;
      case 'UPDATE_COMMISSION':
        return <Badge variant="rose">Updated Commission</Badge>;
      case 'ADMIN_LOGIN':
        return <Badge variant="olive">Admin Sign In</Badge>;
      default:
        return <Badge variant="blush">{action}</Badge>;
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Administrative Audit Activity Logs"
          subtitle="Immutable chronological ledger of curator actions, user state updates, and governance events"
        />

        <main className="p-8 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : logs.length > 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8DFDD] overflow-hidden shadow-soft">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F6] border-b border-[#E8DFDD] text-closea-grey uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">Administrator</th>
                    <th className="py-3.5 px-6">Action</th>
                    <th className="py-3.5 px-6">Target Record</th>
                    <th className="py-3.5 px-6">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-closea-blush">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF7F6]/60 transition-colors">
                      <td className="py-4 px-6 text-[#3D322E] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-4 px-6 font-semibold text-[#2D2522]">
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-[#8B5E56]" />
                          <span>{log.admin?.name || 'Administrator'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">{getActionBadge(log.action)}</td>

                      <td className="py-4 px-6 font-mono text-[11px] text-closea-grey">
                        {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                      </td>

                      <td className="py-4 px-6 text-closea-grey font-light max-w-md">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-[#E8DFDD] text-center text-xs text-[#3D322E]">
              No audit logs recorded yet.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
