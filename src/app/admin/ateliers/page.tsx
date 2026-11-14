'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Scissors, PlusCircle, MapPin, Mail, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAteliersPage() {
  const [ateliers, setAteliers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Qena');
  const [postalCode, setPostalCode] = useState('75001');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAteliers = async () => {
    setIsLoading(true);
    try {
      const [atRes, assignRes] = await Promise.all([fetch('/api/ateliers'), fetch('/api/atelier/assignments')]);
      if (atRes.ok) { const aData = await atRes.json(); setAteliers(aData.ateliers || []); }
      if (assignRes.ok) { const assignData = await assignRes.json(); setAssignments(assignData.assignments || []); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { loadAteliers(); }, []);

  const handleCreateAtelier = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/ateliers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contactPerson, email, phone, address, city, postalCode }),
      });
      if (res.ok) { setIsAddModalOpen(false); setName(''); setContactPerson(''); setEmail(''); setPhone(''); setAddress(''); await loadAteliers(); }
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#FAF7F6]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title="Partner Atelier Governance" subtitle="Manage certified tailor partners, monitor cleaning stages, and inspect handover throughput" />

        <main className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div><h2 className="text-2xl font-extrabold text-closea-ink">Certified Partners ({ateliers.length})</h2><p className="text-sm font-medium text-closea-inkSoft mt-1">Partners managing fitting lounges, delicate steam care, and handovers.</p></div>
            <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}><PlusCircle className="w-4 h-4 mr-2" />Add Atelier</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ateliers.map((atelier) => (
              <div key={atelier.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-start justify-between">
                  <div><Badge variant="olive">Certified</Badge><h3 className="text-xl font-extrabold text-closea-ink mt-2">{atelier.name}</h3></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-50 text-closea-inkSoft">{atelier._count?.assignments || 0} Tasks</span>
                </div>
                <div className="space-y-2 text-sm font-medium text-closea-inkSoft border-t border-gray-100 pt-3">
                  <p className="flex items-center"><MapPin className="w-4 h-4 text-closea-rosewood mr-2" />{atelier.address}, {atelier.city}</p>
                  <p className="flex items-center"><Mail className="w-4 h-4 text-closea-rosewood mr-2" />{atelier.email}</p>
                  <p className="flex items-center"><Phone className="w-4 h-4 text-closea-rosewood mr-2" />{atelier.phone} (Lead: {atelier.contactPerson})</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-extrabold text-closea-ink">Garments Under Care ({assignments.length})</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-closea-inkSoft uppercase tracking-wider text-[10px] font-bold">
                  <tr><th className="py-4 px-6">Atelier</th><th className="py-4 px-6">Dress</th><th className="py-4 px-6">Ref</th><th className="py-4 px-6">Stage</th><th className="py-4 px-6">Last Update</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map((assign) => (
                    <tr key={assign.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-closea-ink">{assign.atelier?.name}</td>
                      <td className="py-4 px-6"><strong className="block text-closea-ink">{assign.dress?.title}</strong><span className="text-xs text-closea-rosewood font-bold">{assign.dress?.brand}</span></td>
                      <td className="py-4 px-6 font-mono text-xs text-closea-inkSoft">#{assign.booking?.bookingReference}</td>
                      <td className="py-4 px-6"><Badge variant="olive" dot>{assign.operationalStatus}</Badge></td>
                      <td className="py-4 px-6 text-xs text-closea-inkSoft font-medium">{formatDate(assign.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Partner Atelier" description="Add a certified boutique to manage dress fittings and care.">
        <form onSubmit={handleCreateAtelier} className="space-y-4">
          <Input label="Atelier Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Atelier Haussmann" required />
          <Input label="Lead Tailor" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="e.g. Éléonore Vasseur" required />
          <div className="grid grid-cols-2 gap-4"><Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /><Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
          <Input label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4"><Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required /><Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100"><Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit" variant="primary" isLoading={isSubmitting}>Add Atelier</Button></div>
        </form>
      </Modal>
    </div>
  );
}