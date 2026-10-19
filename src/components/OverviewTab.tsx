import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Star,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  RefreshCw,
  PhoneCall,
  Sparkles,
  Zap,
  ShieldCheck,
  Send,
  Smartphone,
  BellRing
} from 'lucide-react';
import { Booking, Conversation, FeedbackItem, Patient } from '../types';

interface OverviewTabProps {
  bookings: Booking[];
  conversations: Conversation[];
  feedback: FeedbackItem[];
  patients: Patient[];
  onApproveBooking: (id: string) => void;
  onDeclineBooking: (id: string) => void;
  onSelectConversation: (id: string) => void;
  onOpenSimulator: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenConnectWhatsApp: () => void;
  onOpenBulkReminders: () => void;
  isWhatsAppConnected?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  bookings,
  conversations,
  feedback,
  patients,
  onApproveBooking,
  onDeclineBooking,
  onSelectConversation,
  onOpenSimulator,
  onNavigateTab,
  onOpenConnectWhatsApp,
  onOpenBulkReminders,
  isWhatsAppConnected = false
}) => {
  const pendingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'rescheduled_pending'
  );
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const todayBookings = bookings.filter(
    (b) => b.date === '2026-10-18' || b.date.toLowerCase().includes('tomorrow')
  );

  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                WhatsApp Bot Active 24/7
              </span>
              <span className="text-xs text-emerald-200/80">
                {isWhatsAppConnected ? 'Meta Cloud API Connected' : 'Ready to Connect Meta API'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              SmileCraft Dental Studio
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1">
              Your automated WhatsApp booking assistant is triage-ready. Patients can book,
              reschedule, receive 24h reminders, and leave ratings automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenConnectWhatsApp}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                isWhatsAppConnected
                  ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isWhatsAppConnected ? 'Meta WhatsApp Settings' : 'Connect Real WhatsApp'}</span>
            </button>
            <button
              onClick={onOpenBulkReminders}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/25"
              title="Bulk send WhatsApp appointment reminders for the next 48 hours"
            >
              <BellRing className="w-4 h-4 fill-slate-950" />
              <span>Send 48h Reminders</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all border border-white/15"
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulate Patient</span>
            </button>
            <button
              onClick={() => onNavigateTab('flow')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-all border border-white/10"
            >
              <span>Bot Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Schedule
            </span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{todayBookings.length}</span>
            <span className="text-xs font-medium text-slate-500">appointments</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{confirmedBookings.length} confirmed on doctor calendars</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigateTab('bookings')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition-all relative overflow-hidden"
        >
          {pendingBookings.length > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-lg bg-amber-500" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              {pendingBookings.length}
            </span>
            <span className="text-xs font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
              Requires Staff Action
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Patients waiting for slot confirmation
          </p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateTab('chats')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active WhatsApp Chats
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{conversations.length}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              Live Inbox
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Avg bot response: &lt;1.8 seconds</p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateTab('feedback')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Patient Satisfaction
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{avgRating}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
              {feedback.length} Reviews
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">98% would recommend to family</p>
        </div>
      </div>

      {/* Main Grid: Pending Action Center & Live WhatsApp Inbox Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Action Required Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-base font-bold text-slate-900">
                  New WhatsApp Booking & Reschedule Requests
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {pendingBookings.length}
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('bookings')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All Bookings</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">
                  No pending appointment requests waiting for staff confirmation.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingBookings.map((booking) => {
                  const isReschedule = booking.status === 'rescheduled_pending';
                  return (
                    <div
                      key={booking.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/80 p-3 rounded-xl transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {booking.patientName}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {booking.patientPhone}
                          </span>
                          {isReschedule ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                              Reschedule Request
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              New Request
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          <span className="text-slate-900 font-bold">{booking.service}</span> •{' '}
                          <span className="text-emerald-700 font-semibold">
                            {booking.date} at {booking.time}
                          </span>{' '}
                          with {booking.dentistName}
                        </p>

                        {booking.notes && (
                          <p className="text-xs text-slate-500 italic bg-slate-100/80 px-2.5 py-1 rounded-md max-w-lg">
                            "{booking.notes}"
                          </p>
                        )}
                        {isReschedule && booking.previousSlot && (
                          <p className="text-[11px] text-purple-700">
                            Previous slot: {booking.previousSlot.date} at{' '}
                            {booking.previousSlot.time} (remains reserved until approved)
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onApproveBooking(booking.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          title="Confirm appointment and send WhatsApp confirmation message to patient"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Notify</span>
                        </button>
                        <button
                          onClick={() => onDeclineBooking(booking.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-medium transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Schedule Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Doctor Operatory Schedule (Today & Tomorrow)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenBulkReminders}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-700" />
                  <span>Send 48h Reminders</span>
                </button>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                  Hours: 08:30 - 18:30
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {b.time}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{b.patientName}</p>
                    <p className="text-xs text-slate-500">{b.service}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      {b.dentistName}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const conv = conversations.find((c) => c.patientId === b.patientId);
                      if (conv) onSelectConversation(conv.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Open WhatsApp chat with patient"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live WhatsApp Inbox feed & Gateway status */}
        <div className="space-y-6">
          {/* Live Chats preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent WhatsApp Chats</h3>
              </div>
              <button
                onClick={() => onNavigateTab('chats')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Open Inbox
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={conv.patientAvatar}
                      alt={conv.patientName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {conv.patientName}
                        </p>
                        {conv.isBotPaused && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Staff Took Over
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {conv.lastMessageTime}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="block mt-1 ml-auto text-[10px] font-bold w-4 h-4 rounded-full bg-emerald-600 text-white text-center leading-4">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta & WhatsApp Cloud Gateway Status */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  WhatsApp Business Gateway
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Clinic Number</span>
                <span className="font-mono text-emerald-300 font-semibold">+1 (415) 555-0188</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Webhook Status</span>
                <span className="text-emerald-400 font-semibold">Active (signed, 200 OK)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Automated Reminders</span>
                <span className="text-slate-200">24h & 2h before visit</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Google Sheets Sync</span>
                <span className="text-emerald-400">Live 2-Way Sync</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={onOpenConnectWhatsApp}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Configure Live WhatsApp API</span>
              </button>

              <button
                onClick={() => onNavigateTab('sheets')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Google Sheet Sync Logs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
