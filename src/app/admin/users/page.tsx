'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, ShieldAlert, CheckCircle2, UserX, UserCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter, search]);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionUserId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          status: nextStatus,
          reason: `Admin toggle status to ${nextStatus}`,
        }),
      });
      if (res.ok) {
        await loadUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="User Governance & Directory"
          subtitle="Manage verified customers, dress owners, and atelier operators"
        />

        <main className="p-8 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E8DFDD]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-closea-grey-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-rose"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              {['all', 'CUSTOMER', 'OWNER', 'ATELIER', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    roleFilter === r
                      ? 'bg-closea-rose text-white shadow-sm'
                      : 'bg-[#FAF7F6] text-closea-grey hover:bg-closea-blush/60'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-closea-rose border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : users.length > 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8DFDD] overflow-hidden shadow-soft">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F6] border-b border-[#E8DFDD] text-closea-grey uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Member Name & Email</th>
                    <th className="py-3.5 px-6">Platform Role</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Activity</th>
                    <th className="py-3.5 px-6">Account Status</th>
                    <th className="py-3.5 px-6 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-closea-blush">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF7F6]/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {u.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-closea-blush"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-closea-blush text-closea-grey flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <strong className="block text-closea-grey font-medium text-sm">
                              {u.name}
                            </strong>
                            <span className="text-[11px] text-[#3D322E]">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            u.role === 'ADMIN'
                              ? 'rose'
                              : u.role === 'OWNER'
                              ? 'olive'
                              : u.role === 'ATELIER'
                              ? 'sage'
                              : 'blush'
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-[#3D322E]">
                        {u.location || 'Qena, France'}
                      </td>

                      <td className="py-4 px-6 text-closea-grey">
                        <span className="block">
                          <strong>{u.dressesCount}</strong> Dresses Listed
                        </span>
                        <span className="text-[11px] text-[#3D322E]">
                          <strong>{u.bookingsCount}</strong> Bookings
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant={u.status === 'ACTIVE' ? 'sage' : 'grey'} dot>
                          {u.status}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {u.role !== 'ADMIN' && (
                          <Button
                            variant={u.status === 'ACTIVE' ? 'outline' : 'sage'}
                            size="sm"
                            isLoading={actionUserId === u.id}
                            onClick={() => handleToggleStatus(u)}
                            className={u.status === 'ACTIVE' ? 'text-red-600 border-red-200' : ''}
                          >
                            {u.status === 'ACTIVE' ? (
                              <>
                                <UserX className="w-3.5 h-3.5 mr-1" />
                                Suspend Account
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                Reactivate
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-[#E8DFDD] text-center text-xs text-[#3D322E]">
              No users found matching the filter criteria.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
