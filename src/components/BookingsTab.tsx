import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  CheckCheck,
  AlertCircle,
  Plus,
  Search,
  Filter,
  User,
  Phone,
  MessageSquare,
  BellRing,
  Star,
  DollarSign
} from 'lucide-react';
import { Booking, Dentist, DentalService } from '../types';
import { calculateReminderStats } from '../utils/reminder-utils';

interface BookingsTabProps {
  bookings: Booking[];
  dentists: Dentist[];
  services: DentalService[];
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => void;
  onCancel: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onSendReminder: (id: string, type: '24h' | '2h') => void;
  onOpenChat: (patientId: string) => void;
  onCreateManualBooking: (bookingData: Partial<Booking>) => void;
  onOpenBulkReminders: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({
  bookings,
  dentists,
  services,
  onApprove,
  onDecline,
  onReschedule,
  onCancel,
  onMarkCompleted,
  onSendReminder,
  onOpenChat,
  onCreateManualBooking,
  onOpenBulkReminders
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'upcoming' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDentist, setSelectedDentist] = useState<string>('all');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-10-21');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');

  // Manual booking form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newService, setNewService] = useState(services[0]?.name || 'Comprehensive Checkup & X-Rays');
  const [newDentistId, setNewDentistId] = useState(dentists[0]?.id || 'dentist-1');
  const [newDate, setNewDate] = useState('2026-10-19');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newNotes, setNewNotes] = useState('');

  const pendingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'rescheduled_pending'
  );
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const historyBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined'
  );

  const reminderStats = calculateReminderStats(bookings, '2026-10-18');

  const getFilteredBookings = () => {
    let list: Booking[] = [];
    if (activeSubTab === 'pending') list = pendingBookings;
    else if (activeSubTab === 'upcoming') list = upcomingBookings;
    else list = historyBookings;

    return list.filter((b) => {
      const matchesSearch =
        b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.patientPhone.includes(searchQuery) ||
        b.service.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDentist = selectedDentist === 'all' || b.dentistId === selectedDentist;

      return matchesSearch && matchesDentist;
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = dentists.find((d) => d.id === newDentistId);
    onCreateManualBooking({
      patientName: newPatientName,
      patientPhone: newPatientPhone,
      service: newService,
      dentistId: newDentistId,
      dentistName: doc?.name || 'Dr. Sarah Jenkins',
      date: newDate,
      time: newTime,
      notes: newNotes,
      status: 'confirmed',
      reminder24hSent: false,
      reminder2hSent: false,
      fee: services.find((s) => s.name === newService)?.price || 100
    });

    setIsNewBookingModalOpen(false);
    setNewPatientName('');
    setNewPatientPhone('');
    setNewNotes('');
  };

  const currentList = getFilteredBookings();

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Appointment Pipeline & Bookings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming WhatsApp requests, confirm slots, trigger reminders, and manage patient visits.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={onOpenBulkReminders}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
              title="Bulk send WhatsApp appointment reminders to all patients with upcoming bookings for the next 48 hours"
            >
              <BellRing className="w-4 h-4" />
              <span>Bulk Send Reminders (48h)</span>
              {reminderStats.unsentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-950 font-black">
                  {reminderStats.unsentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New In-Clinic Booking</span>
            </button>
          </div>
        </div>

        {/* Filters and Sub-tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          {/* Sub tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Pending Requests</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25 text-white">
                {pendingBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('upcoming')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'upcoming'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Upcoming Confirmed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25 text-white">
                {upcomingBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'history'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Visit History</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25 text-white">
                {historyBookings.length}
              </span>
            </button>
          </div>

          {/* Search & Doctor Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <select
              value={selectedDentist}
              onChange={(e) => setSelectedDentist(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-700 font-medium"
            >
              <option value="all">All Doctors</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 48-Hour Reminder Banner when viewing Upcoming */}
      {activeSubTab === 'upcoming' && (
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-900">
                  48-Hour WhatsApp Appointment Reminder Pipeline
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">
                  {reminderStats.unsentCount} Pending
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {reminderStats.totalNext48h} visits scheduled in the next 48 hours ({reminderStats.alreadySentCount} already reminded). Send automated WhatsApp confirmations to reduce no-shows.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBulkReminders}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto"
          >
            <BellRing className="w-4 h-4" />
            <span>Send 48h Reminders</span>
          </button>
        </div>
      )}

      {/* Bookings List Cards */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No appointments found</p>
            <p className="text-xs text-slate-400 mt-1">
              There are no {activeSubTab} bookings matching your current filter.
            </p>
          </div>
        ) : (
          currentList.map((bk) => {
            const isReschedule = bk.status === 'rescheduled_pending';
            const isPending = bk.status === 'pending';
            const isConfirmed = bk.status === 'confirmed';
            const isCompleted = bk.status === 'completed';

            return (
              <div
                key={bk.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-emerald-300 transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                {/* Left: Patient Info & Service */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-slate-900">
                      {bk.patientName}
                    </span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {bk.patientPhone}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isReschedule
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCompleted
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {bk.status === 'rescheduled_pending'
                        ? 'Reschedule Requested'
                        : bk.status.toUpperCase()}
                    </span>

                    <span className="text-xs font-bold text-slate-700">
                      Fee: ${bk.fee}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <span className="text-emerald-700 font-bold">{bk.service}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bk.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bk.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-medium">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{bk.dentistName}</span>
                    </div>
                  </div>

                  {bk.notes && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 max-w-2xl">
                      <strong>Notes:</strong> {bk.notes}
                    </p>
                  )}

                  {isReschedule && bk.previousSlot && (
                    <div className="text-xs text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>
                        Old slot was <strong>{bk.previousSlot.date} at {bk.previousSlot.time}</strong> (held active until you approve this new time).
                      </span>
                    </div>
                  )}

                  {isCompleted && bk.feedbackRating && (
                    <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      <span>
                        Rated {bk.feedbackRating}/5 stars: "{bk.feedbackComment}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Chat button */}
                  <button
                    onClick={() => onOpenChat(bk.patientId)}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-colors"
                    title="Open WhatsApp chat with patient"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {/* Actions for Pending or Rescheduled */}
                  {(isPending || isReschedule) && (
                    <>
                      <button
                        onClick={() => onApprove(bk.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        title="Approve booking and send WhatsApp confirmation template"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve & Notify</span>
                      </button>

                      <button
                        onClick={() => {
                          setRescheduleTarget(bk);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Alternative Slot
                      </button>

                      <button
                        onClick={() => onDecline(bk.id)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* Actions for Confirmed */}
                  {isConfirmed && (
                    <>
                      <button
                        onClick={() => onMarkCompleted(bk.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                        title="Mark visit finished and automatically send feedback rating prompt to patient on WhatsApp"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark Completed & Request Feedback</span>
                      </button>

                      {/* Reminder buttons */}
                      <button
                        onClick={() => onSendReminder(bk.id, '24h')}
                        className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                          bk.reminder24hSent
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        title="Simulate sending 24h WhatsApp reminder template"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>{bk.reminder24hSent ? '24h Sent ✓' : 'Send 24h Reminder'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setRescheduleTarget(bk);
                        }}
                        className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => onCancel(bk.id)}
                        className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-700 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-slate-900">
              Reschedule Appointment for {rescheduleTarget.patientName}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select the new confirmed date and time. An updated WhatsApp confirmation message will be sent.
            </p>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:15 PM">05:15 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReschedule(rescheduleTarget.id, rescheduleDate, rescheduleTime);
                  setRescheduleTarget(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Confirm & Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New In-Clinic Booking Modal */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                Create In-Clinic Appointment
              </h3>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Anderson"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (415) 555-0123"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service / Procedure
                </label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (${s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dentist</label>
                <select
                  value={newDentistId}
                  onChange={(e) => setNewDentistId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  {dentists.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:15 AM">11:15 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:45 PM">04:45 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Patient requests nitrous oxide or has specific sensitivity..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Create & Send WhatsApp Confirmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
