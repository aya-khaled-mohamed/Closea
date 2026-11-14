'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, UserX, UserCheck, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [roleFilter, statusFilter, search]);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionUserId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: nextStatus, reason: `Admin toggle to ${nextStatus}` }),
      });
      if (res.ok) await loadUsers();
    } catch (e) { console.error(e); } finally { setActionUserId(null); }
  };

  const handleToggleRole = async (user: any) => {
    const nextRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    setActionUserId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: nextRole, reason: `Admin role change to ${nextRole}` }),
      });
      if (res.ok) await loadUsers();
    } catch (e) { console.error(e); } finally { setActionUserId(null); }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#FAF7F6]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="User Governance & Directory" subtitle="Manage verified customers, dress owners, and atelier operators" />

        <main className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user name or email..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-closea-rosewood" />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              {['all', 'CUSTOMER', 'OWNER', 'ATELIER', 'ADMIN'].map((r) => (
                <button key={r} onClick={() => setRoleFilter(r)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${roleFilter === r ? 'bg-closea-ink text-white shadow-sm' : 'bg-gray-50 text-closea-inkSoft hover:bg-gray-100'}`}>
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-closea-rosewood border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : users.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-closea-inkSoft uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-4 px-6">Member</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Activity</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {u.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-closea-blush text-closea-rosewood flex items-center justify-center font-bold text-xs">{u.name.charAt(0)}</div>
                          )}
                          <div><strong className="block text-closea-ink font-bold">{u.name}</strong><span className="text-xs text-closea-inkSoft">{u.email}</span></div>
                        </div>
                      </td>
                      <td className="py-4 px-6"><Badge variant={u.role === 'ADMIN' ? 'rose' : u.role === 'OWNER' ? 'olive' : u.role === 'ATELIER' ? 'sage' : 'blush'}>{u.role}</Badge></td>
                      <td className="py-4 px-6 text-closea-inkSoft font-medium">{u.location || 'Cairo'}</td>
                      <td className="py-4 px-6 text-closea-inkSoft"><span className="block font-bold text-closea-ink">{u.dressesCount} Dresses</span><span className="text-xs">{u.bookingsCount} Bookings</span></td>
                      <td className="py-4 px-6"><Badge variant={u.status === 'ACTIVE' ? 'sage' : 'grey'} dot>{u.status}</Badge></td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {u.role !== 'ADMIN' && (
                          <Button variant="sage" size="sm" isLoading={actionUserId === u.id} onClick={() => handleToggleRole(u)}>
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Make Admin
                          </Button>
                        )}
                        {u.role === 'ADMIN' && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200" isLoading={actionUserId === u.id} onClick={() => handleToggleRole(u)}>
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            Revoke Admin
                          </Button>
                        )}
                        <Button variant={u.status === 'ACTIVE' ? 'outline' : 'sage'} size="sm" isLoading={actionUserId === u.id} onClick={() => handleToggleStatus(u)} className={u.status === 'ACTIVE' ? 'text-red-600 border-red-200' : ''}>
                          {u.status === 'ACTIVE' ? <><UserX className="w-3.5 h-3.5 mr-1" />Suspend</> : <><UserCheck className="w-3.5 h-3.5 mr-1" />Reactivate</>}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-gray-100 text-center text-sm font-medium text-closea-inkSoft shadow-sm">No users found matching the filter criteria.</div>
          )}
        </main>
      </div>
    </div>
  );
}