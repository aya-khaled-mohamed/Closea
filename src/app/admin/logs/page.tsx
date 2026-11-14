'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { User } from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/logs');
        if (res.ok) { const data = await res.json(); setLogs(data.logs || []); }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }
    loadLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE_LISTING': return <Badge variant="sage">Approved Listing</Badge>;
      case 'REJECT_LISTING': return <Badge variant="grey">Rejected Listing</Badge>;
      case 'SUSPEND_USER': return <Badge variant="grey">Suspended User</Badge>;
      case 'UPDATE_COMMISSION': return <Badge variant="rose">Updated Commission</Badge>;
      case 'ADMIN_LOGIN': return <Badge variant="olive">Admin Sign In</Badge>;
      default: return <Badge variant="blush">{action}</Badge>;
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#FAF7F6]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Administrative Audit Logs" subtitle="Immutable chronological ledger of curator actions and governance events" />

        <main className="p-8 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : logs.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-closea-inkSoft uppercase tracking-wider text-[10px] font-bold">
                  <tr><th className="py-4 px-6">Timestamp</th><th className="py-4 px-6">Admin</th><th className="py-4 px-6">Action</th><th className="py-4 px-6">Target</th><th className="py-4 px-6">Details</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-closea-inkSoft font-medium whitespace-nowrap">{new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-4 px-6 font-bold text-closea-ink"><div className="flex items-center space-x-2"><User className="w-4 h-4 text-closea-rosewood" /><span>{log.admin?.name || 'Admin'}</span></div></td>
                      <td className="py-4 px-6">{getActionBadge(log.action)}</td>
                      <td className="py-4 px-6 font-mono text-xs text-closea-inkSoft">{log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}</td>
                      <td className="py-4 px-6 text-closea-inkSoft font-medium max-w-md">{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-gray-100 text-center text-sm font-medium text-closea-inkSoft shadow-sm">No audit logs recorded yet.</div>
          )}
        </main>
      </div>
    </div>
  );
}