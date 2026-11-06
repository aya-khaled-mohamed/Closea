'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatDateRange } from '@/lib/utils';

export default function AtelierPortalPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Stage update modal
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [nextStage, setNextStage] = useState<string>('RECEIVED');
  const [stageNote, setStageNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const [meRes, assignRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/atelier/assignments'),
      ]);

      if (!meRes.ok) {
        router.push('/login?redirect=/atelier');
        return;
      }

      const meData = await meRes.json();
      if (meData.user?.role !== 'ATELIER' && meData.user?.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      setCurrentUser(meData.user);

      if (assignRes.ok) {
        const aData = await assignRes.json();
        setAssignments(aData.assignments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleStageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/atelier/assignments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          operationalStatus: nextStage,
          note: stageNote || `Atelier updated status to ${nextStage}`,
        }),
      });

      if (res.ok) {
        setSelectedAssignment(null);
        setStageNote('');
        await loadAssignments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeAssignments = assignments.filter((a) => a.operationalStatus !== 'RETURNED');
  const completedAssignments = assignments.filter((a) => a.operationalStatus === 'RETURNED');

  const stageOptions = [
    { value: 'AWAITING_DELIVERY', label: '1. Awaiting Delivery from Owner' },
    { value: 'RECEIVED', label: '2. Received & Initial Inspection' },
    { value: 'CLEANING', label: '3. Eco-Solvent Steam & Cleaning' },
    { value: 'ALTERATION', label: '4. Fit Inspection & Minor Alteration' },
    { value: 'READY', label: '5. Ready for Client Collection' },
    { value: 'COLLECTED', label: '6. Collected by Client (Active Rental)' },
    { value: 'RETURNED', label: '7. Returned Post-Event (Inspection Complete)' },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-closea-olive border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#3D322E]">Loading Partner Atelier Portal...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F6] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Atelier Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-closea-blush shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-[#EBF1E9] text-closea-olive">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-editorial text-2xl sm:text-3xl font-normal text-closea-grey">
                  {currentUser?.atelier?.name || 'Partner Atelier Lounge'}
                </h1>
                <Badge variant="olive">Certified Closéa Atelier</Badge>
              </div>
              <p className="text-xs text-[#3D322E] mt-1">
                {currentUser?.atelier?.address}, {currentUser?.atelier?.city} • Contact: {currentUser?.atelier?.contactPerson}
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[#3D322E]">Active Garments in Care:</span>
            <span className="font-editorial text-2xl block text-closea-olive font-medium">
              {activeAssignments.length}
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-4 border-b border-[#E8DFDD]">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'active'
                ? 'border-closea-olive text-closea-olive font-bold'
                : 'border-transparent text-[#3D322E] hover:text-closea-grey'
            }`}
          >
            In-Progress Garment Care ({activeAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'completed'
                ? 'border-closea-olive text-closea-olive font-bold'
                : 'border-transparent text-[#3D322E] hover:text-closea-grey'
            }`}
          >
            Past Returned Garments ({completedAssignments.length})
          </button>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {(activeTab === 'active' ? activeAssignments : completedAssignments).length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {(activeTab === 'active' ? activeAssignments : completedAssignments).map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white p-6 rounded-3xl border border-closea-blush shadow-soft flex flex-col lg:flex-row gap-6 justify-between items-start"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-closea-blush flex-shrink-0">
                      <Image
                        src={assignment.dress?.images[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80'}
                        alt={assignment.dress?.title || ''}
                        fill
                        className="object-cover object-top"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5E56]">
                          {assignment.dress?.brand}
                        </span>
                        <span className="text-[#3D322E]">•</span>
                        <span className="text-xs font-semibold text-closea-grey">
                          Ref: #{assignment.booking?.bookingReference}
                        </span>
                      </div>

                      <h3 className="font-editorial text-2xl font-normal text-closea-grey">
                        {assignment.dress?.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#3D322E] pt-1">
                        <p>
                          <strong>Rental Window:</strong> {formatDateRange(assignment.booking?.startDate, assignment.booking?.endDate)}
                        </p>
                        <p>
                          <strong>Owner Contact:</strong> {assignment.dress?.owner?.name} ({assignment.dress?.owner?.phone || 'On file'})
                        </p>
                        <p>
                          <strong>Client Name:</strong> {assignment.booking?.customer?.name} ({assignment.booking?.customer?.phone || 'On file'})
                        </p>
                        <p>
                          <strong>Special Requests:</strong> {assignment.booking?.specialRequests || 'Standard fit & steam'}
                        </p>
                      </div>

                      {/* Processing History Records */}
                      {assignment.processingRecords?.length > 0 && (
                        <div className="pt-2 text-[11px] text-[#3D322E]">
                          <span className="font-semibold text-closea-grey block mb-1">Recent Activity Log:</span>
                          <ul className="space-y-1">
                            {assignment.processingRecords.slice(0, 2).map((rec: any) => (
                              <li key={rec.id} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-closea-olive" />
                                <strong>[{rec.stage}]</strong> {rec.description} — <em className="text-closea-grey-muted">{formatDate(rec.createdAt)}</em>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Status Control */}
                  <div className="w-full lg:w-72 flex flex-col justify-between items-start lg:items-end space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-closea-blush lg:pl-6">
                    <div className="flex flex-col items-start lg:items-end space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#3D322E]">
                        Current Garment Stage
                      </span>
                      <Badge variant="olive" dot>
                        {assignment.operationalStatus}
                      </Badge>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setNextStage(assignment.operationalStatus);
                      }}
                      className="w-full lg:w-auto"
                    >
                      Update Stage & Log Notes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-closea-blush text-center space-y-3">
              <Package className="w-10 h-10 text-closea-olive mx-auto" />
              <h3 className="font-editorial text-2xl font-normal text-closea-grey">No Garments in this Category</h3>
              <p className="text-xs text-[#3D322E] max-w-sm mx-auto">
                Garments assigned to your atelier for fitting, cleaning, and collection will be listed here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* STAGE PROGRESSION MODAL */}
      <Modal
        isOpen={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        title="Update Garment Operational Stage"
        description={`Garment: ${selectedAssignment?.dress?.title} (#${selectedAssignment?.booking?.bookingReference})`}
      >
        <form onSubmit={handleStageUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
              Select Current Operational Stage
            </label>
            <select
              value={nextStage}
              onChange={(e) => setNextStage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey bg-white focus:outline-none focus:border-closea-olive"
            >
              {stageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-closea-grey">
              Inspection / Tailoring Notes
            </label>
            <textarea
              value={stageNote}
              onChange={(e) => setStageNote(e.target.value)}
              placeholder="e.g. Steamed and inspected. Seams pristine. Garment hung in protective dust bag ready for client collection."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFDD] text-xs text-closea-grey focus:outline-none focus:border-closea-olive"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-closea-blush">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedAssignment(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="sage" isLoading={isUpdating}>
              Confirm Stage Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
