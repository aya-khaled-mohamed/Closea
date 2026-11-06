'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Scissors, PlusCircle, MapPin, Mail, Phone, Package, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAteliersPage() {
  const [ateliers, setAteliers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Atelier Modal
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
      const [atRes, assignRes] = await Promise.all([
        fetch('/api/ateliers'),
        fetch('/api/atelier/assignments'),
      ]);

      if (atRes.ok) {
        const aData = await atRes.json();
        setAteliers(aData.ateliers || []);
      }

      if (assignRes.ok) {
        const assignData = await assignRes.json();
        setAssignments(assignData.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAteliers();
  }, []);

  const handleCreateAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/ateliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contactPerson,
          email,
          phone,
          address,
          city,
          postalCode,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setAddress('');
        await loadAteliers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Partner Atelier Governance & Operations"
          subtitle="Manage certified tailor partners, monitor cleaning stages, and inspect handover throughput"
        />

        <main className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-editorial text-2xl font-normal text-closea-grey">
                Certified Qena Ateliers ({ateliers.length})
              </h2>
              <p className="text-xs text-[#3D322E]">
                Partners managing fitting lounges, delicate steam care, and customer handovers.
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Partner Atelier
            </Button>
          </div>

          {/* Ateliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ateliers.map((atelier) => (
              <div
                key={atelier.id}
                className="bg-white p-6 rounded-3xl border border-[#E8DFDD] shadow-soft space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="olive">Certified Partner</Badge>
                    <h3 className="font-editorial text-2xl font-normal text-closea-grey mt-2">
                      {atelier.name}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-closea-blush text-closea-grey">
                    {atelier._count?.assignments || 0} Tasks Handled
                  </span>
                </div>

                <div className="space-y-2 text-xs text-closea-grey border-t border-closea-blush pt-3">
                  <p className="flex items-center text-[#3D322E]">
                    <MapPin className="w-3.5 h-3.5 text-[#8B5E56] mr-2 flex-shrink-0" />
                    <span>{atelier.address}, {atelier.city} {atelier.postalCode}</span>
                  </p>
                  <p className="flex items-center text-[#3D322E]">
                    <Mail className="w-3.5 h-3.5 text-[#8B5E56] mr-2 flex-shrink-0" />
                    <span>{atelier.email}</span>
                  </p>
                  <p className="flex items-center text-[#3D322E]">
                    <Phone className="w-3.5 h-3.5 text-[#8B5E56] mr-2 flex-shrink-0" />
                    <span>{atelier.phone} (Lead: {atelier.contactPerson})</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Garments in Atelier Care */}
          <div className="space-y-4 pt-4">
            <h3 className="font-editorial text-2xl font-normal text-closea-grey">
              Garments Currently Under Atelier Care ({assignments.length})
            </h3>

            <div className="bg-white rounded-3xl border border-[#E8DFDD] overflow-hidden shadow-soft">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F6] border-b border-[#E8DFDD] text-closea-grey uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Atelier Partner</th>
                    <th className="py-3.5 px-6">Dress & Designer</th>
                    <th className="py-3.5 px-6">Reservation Ref</th>
                    <th className="py-3.5 px-6">Current Operational Stage</th>
                    <th className="py-3.5 px-6">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-closea-blush">
                  {assignments.map((assign) => (
                    <tr key={assign.id} className="hover:bg-[#FAF7F6]/60">
                      <td className="py-4 px-6 font-semibold text-[#2D2522]">
                        {assign.atelier?.name}
                      </td>
                      <td className="py-4 px-6">
                        <strong>{assign.dress?.title}</strong>
                        <span className="block text-[11px] text-[#8B5E56]">{assign.dress?.brand}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-closea-grey">
                        #{assign.booking?.bookingReference}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="olive" dot>
                          {assign.operationalStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-[#3D322E]">
                        {formatDate(assign.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ADD ATELIER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Partner Atelier"
        description="Add a certified tailoring boutique to manage dress fittings and eco-solvent care."
      >
        <form onSubmit={handleCreateAtelier} className="space-y-3">
          <Input
            label="Atelier Boutique Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Atelier Haussmann Couture"
            required
          />

          <Input
            label="Lead Tailor / Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Éléonore Vasseur"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@atelier-haussmann.com"
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 1 42 68 00 00"
              required
            />
          </div>

          <Input
            label="Street Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 42 Boulevard Haussmann"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Qena"
              required
            />
            <Input
              label="Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="75009"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-closea-blush">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add Atelier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
