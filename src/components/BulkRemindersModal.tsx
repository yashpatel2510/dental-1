import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Send,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Check,
  User,
  ShieldCheck,
  Eye,
  Sliders,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Booking, Patient } from '../types';
import {
  getBookingsForNext48Hours,
  calculateReminderStats,
  formatReminderMessage,
  DEFAULT_REMINDER_TEMPLATE
} from '../utils/reminder-utils';

interface BulkRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  patients: Patient[];
  clinicName?: string;
  onSendBulkReminders: (
    selectedBookingIds: string[],
    template: string
  ) => Promise<{ success: boolean; sentCount: number }>;
}

export const BulkRemindersModal: React.FC<BulkRemindersModalProps> = ({
  isOpen,
  onClose,
  bookings,
  patients,
  clinicName = 'SmileCraft Dental Studio',
  onSendBulkReminders
}) => {
  const [filterMode, setFilterMode] = useState<'unsent' | 'all'>('unsent');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState<string>(DEFAULT_REMINDER_TEMPLATE);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [previewBookingId, setPreviewBookingId] = useState<string | null>(null);

  // Sending progress states
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendProgress, setSendProgress] = useState<{
    current: number;
    total: number;
    currentPatientName?: string;
    completed: boolean;
  }>({ current: 0, total: 0, completed: false });

  // Calculate 48h bookings
  const next48hBookings = useMemo(() => {
    return getBookingsForNext48Hours(bookings, '2026-10-18', false);
  }, [bookings]);

  const stats = useMemo(() => {
    return calculateReminderStats(bookings, '2026-10-18');
  }, [bookings]);

  // Display list based on filter
  const displayedBookings = useMemo(() => {
    if (filterMode === 'unsent') {
      return next48hBookings.filter((b) => !b.reminder24hSent);
    }
    return next48hBookings;
  }, [next48hBookings, filterMode]);

  // Initialize selected IDs when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      const unsentIds = next48hBookings.filter((b) => !b.reminder24hSent).map((b) => b.id);
      setSelectedIds(new Set(unsentIds));
      setSendProgress({ current: 0, total: 0, completed: false });
      setIsSending(false);

      if (next48hBookings.length > 0) {
        setPreviewBookingId(next48hBookings[0].id);
      }
    }
  }, [isOpen, next48hBookings]);

  if (!isOpen) return null;

  const handleToggleSelectAll = () => {
    if (selectedIds.size === displayedBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedBookings.map((b) => b.id)));
    }
  };

  const handleToggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedBookings = displayedBookings.filter((b) => selectedIds.has(b.id));

  // Determine which booking to preview
  const currentPreviewBooking =
    displayedBookings.find((b) => b.id === previewBookingId) ||
    selectedBookings[0] ||
    displayedBookings[0];

  const previewMessage = currentPreviewBooking
    ? formatReminderMessage(
        template,
        {
          patientName: currentPreviewBooking.patientName,
          dentistName: currentPreviewBooking.dentistName,
          date: currentPreviewBooking.date,
          time: currentPreviewBooking.time,
          service: currentPreviewBooking.service
        },
        clinicName
      )
    : '';

  const handleSendDispatch = async () => {
    if (selectedIds.size === 0) return;

    setIsSending(true);
    const idsToSend = Array.from(selectedIds);
    setSendProgress({ current: 0, total: idsToSend.length, completed: false });

    // Animated realistic progress simulation while sending
    for (let i = 0; i < idsToSend.length; i++) {
      const b = bookings.find((item) => item.id === idsToSend[i]);
      setSendProgress({
        current: i + 1,
        total: idsToSend.length,
        currentPatientName: b?.patientName,
        completed: false
      });
      // slight step pacing for high-trust user feedback
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    // Call actual dispatch handler in App.tsx
    await onSendBulkReminders(idsToSend, template);

    setSendProgress((prev) => ({ ...prev, completed: true }));
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  Bulk WhatsApp Appointment Reminders
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  Next 48 Hours
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Send 24h WhatsApp confirmation prompts with 1-click to prevent clinic no-shows.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Eligible (Next 48h)
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {stats.totalNext48h}
                </span>
                <span className="text-[11px] text-slate-500 block">confirmed visits</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div
              onClick={() => setFilterMode('unsent')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                filterMode === 'unsent'
                  ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Pending Reminders
                  </span>
                  <span className="text-2xl font-black text-amber-900">
                    {stats.unsentCount}
                  </span>
                  <span className="text-[11px] text-amber-700 block">no reminder sent yet</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setFilterMode('all')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                filterMode === 'all'
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Already Reminded
                  </span>
                  <span className="text-2xl font-black text-emerald-900">
                    {stats.alreadySentCount}
                  </span>
                  <span className="text-[11px] text-emerald-700 block">sent in last 24h</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Selection Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter View:</span>
              <button
                type="button"
                onClick={() => setFilterMode('unsent')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'unsent'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Only Unsent ({stats.unsentCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Upcoming 48h ({stats.totalNext48h})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {selectedIds.size === displayedBookings.length
                  ? 'Deselect All'
                  : `Select All (${displayedBookings.length})`}
              </button>
              <span className="text-xs font-semibold text-slate-500">
                {selectedIds.size} of {displayedBookings.length} selected
              </span>
            </div>
          </div>

          {/* Active Sending Progress Banner */}
          {isSending && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  Sending WhatsApp Reminders... ({sendProgress.current} of {sendProgress.total})
                </span>
                <span>{Math.round((sendProgress.current / sendProgress.total) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                  style={{
                    width: `${(sendProgress.current / sendProgress.total) * 100}%`
                  }}
                />
              </div>
              <p className="text-[11px] text-emerald-800">
                Delivering to <strong>{sendProgress.currentPatientName}</strong> via WhatsApp Business gateway...
              </p>
            </div>
          )}

          {/* Send Completed Banner */}
          {sendProgress.completed && (
            <div className="p-4 rounded-xl bg-emerald-600 text-white space-y-2 animate-in fade-in shadow-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="font-extrabold text-sm">
                  Bulk Reminders Successfully Sent!
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Delivered {sendProgress.total} WhatsApp appointment reminders. Patients can reply directly with *1* to confirm or *Reschedule*.
              </p>
            </div>
          )}

          {/* Two-Column Layout: Recipients List & Message Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Patient List */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
                <span>Select Patients to Receive WhatsApp Reminder</span>
                <span className="text-slate-400 font-normal">Click a card to preview</span>
              </div>

              {displayedBookings.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-800">All Reminders Up to Date!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    There are no unreminded confirmed bookings in the next 48 hours.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {displayedBookings.map((b) => {
                    const isSelected = selectedIds.has(b.id);
                    const isPreviewed = currentPreviewBooking?.id === b.id;

                    return (
                      <div
                        key={b.id}
                        onClick={() => setPreviewBookingId(b.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isPreviewed
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40'
                            : isSelected
                            ? 'border-slate-300 bg-white shadow-2xs hover:border-slate-400'
                            : 'border-slate-200 bg-slate-50/60 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleItem(b.id);
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 shrink-0 cursor-pointer"
                        />

                        {/* Patient Avatar & Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                              {b.patientName}
                            </span>
                            {b.reminder24hSent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                <Check className="w-3 h-3 text-emerald-600" />
                                24h Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Unsent
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-600">{b.patientPhone}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-slate-700">
                              {b.date === '2026-10-18' ? 'Today' : b.date === '2026-10-19' ? 'Tomorrow' : b.date} at {b.time}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 mt-1 truncate">
                            <span className="text-slate-400">Doctor:</span> {b.dentistName} | <span className="text-slate-400">Treatment:</span> {b.service}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Message Template Editor & Live Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Message Template</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTemplate(DEFAULT_REMINDER_TEMPLATE)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:underline"
                  >
                    Reset
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-emerald-500"
                />

                <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
                  <span className="font-bold">Tags:</span>
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                    &#123;patient_name&#125;
                  </code>
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                    &#123;dentist_name&#125;
                  </code>
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                    &#123;date&#125;
                  </code>
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                    &#123;time&#125;
                  </code>
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                    &#123;service&#125;
                  </code>
                </div>
              </div>

              {/* Realistic Live WhatsApp Phone Bubble Preview */}
              <div className="bg-[#E5DDD5] rounded-2xl p-4 border border-slate-300 shadow-inner space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-1 border-b border-black/10">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    Live WhatsApp Preview
                  </span>
                  <span className="text-[10px] text-slate-600">
                    Previewing: <strong>{currentPreviewBooking?.patientName || 'Patient'}</strong>
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-xs space-y-2 text-xs text-slate-900 border border-black/5 max-w-sm">
                  <p className="whitespace-pre-line leading-relaxed font-sans text-xs">
                    {previewMessage}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>Just now</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>

                {/* Quick Action Interactive Buttons Preview */}
                <div className="space-y-1">
                  <div className="w-full py-1.5 px-3 bg-white/90 rounded-lg text-center text-xs font-bold text-emerald-800 border border-black/10 shadow-2xs">
                    1. Confirm Appointment
                  </div>
                  <div className="w-full py-1.5 px-3 bg-white/90 rounded-lg text-center text-xs font-bold text-emerald-800 border border-black/10 shadow-2xs">
                    Reschedule Slot
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {selectedIds.size > 0 ? (
              <span>
                Ready to dispatch <strong>{selectedIds.size} WhatsApp reminders</strong>.
              </span>
            ) : (
              <span>Select at least one patient to dispatch reminders.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
            >
              {sendProgress.completed ? 'Close' : 'Cancel'}
            </button>

            <button
              type="button"
              disabled={isSending || selectedIds.size === 0}
              onClick={handleSendDispatch}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSending
                  ? 'Dispatching Reminders...'
                  : `Send Reminders to ${selectedIds.size} Patients`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
