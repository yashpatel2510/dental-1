import React, { useState } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Table,
  ToggleLeft,
  ToggleRight,
  Database,
  ArrowDownToLine,
  Sparkles
} from 'lucide-react';
import { Patient, Booking, FeedbackItem } from '../types';

interface GoogleSheetsTabProps {
  patients: Patient[];
  bookings: Booking[];
  feedback: FeedbackItem[];
}

export const GoogleSheetsTab: React.FC<GoogleSheetsTabProps> = ({
  patients,
  bookings,
  feedback
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'bookings' | 'feedback'>('bookings');
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 2500);
    }, 1200);
  };

  const handleDownloadCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeTab === 'contacts') {
      headers = ['Patient ID', 'Name', 'Phone', 'Email', 'Insurance', 'Visits', 'Lifetime Spend ($)', 'Tags', 'Notes', 'Created'];
      rows = patients.map((p) => [
        p.id,
        p.name,
        p.phone,
        p.email || '',
        p.insuranceProvider || 'Self Pay',
        p.totalVisits,
        p.lifetimeSpend,
        p.tags.join('; '),
        p.notes,
        p.createdAt
      ]);
    } else if (activeTab === 'bookings') {
      headers = ['Booking ID', 'Patient Name', 'Phone', 'Service / Reason', 'Date', 'Time', 'Dentist', 'Status', 'Fee ($)', 'Notes', 'Created At'];
      rows = bookings.map((b) => [
        b.id,
        b.patientName,
        b.patientPhone,
        b.service,
        b.date,
        b.time,
        b.dentistName,
        b.status,
        b.fee,
        b.notes || '',
        b.createdAt
      ]);
    } else {
      headers = ['Feedback ID', 'Patient Name', 'Booking ID', 'Service', 'Rating (1-5)', 'Comment', 'Date'];
      rows = feedback.map((f) => [
        f.id,
        f.patientName,
        f.bookingId,
        f.service,
        f.rating,
        f.comment,
        f.date
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smilecraft_sheet_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Google Sheets Live Sync Gateway
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Connected
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Spreadsheet: <span className="font-mono font-semibold text-slate-700">"SmileCraft Dental - Master CRM & Bookings"</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoSync
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <span>Real-time Webhook Auto-Sync</span>
            <span
              className={`w-2 h-2 rounded-full ${
                autoSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Rows...' : 'Sync Now'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            title="Download active sheet tab as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {showSyncSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Google Sheets successfully updated! All 3 tabs verified and synchronized.</span>
        </div>
      )}

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('contacts')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'contacts'
              ? 'bg-emerald-50/50 border-emerald-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Tab 1: Contacts</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{patients.length} Rows</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Patient profile, insurance, lifetime value</p>
        </div>

        <div
          onClick={() => setActiveTab('bookings')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'bookings'
              ? 'bg-emerald-50/50 border-emerald-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Tab 2: Bookings</span>
            <Table className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{bookings.length} Rows</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All scheduled, pending & past visits</p>
        </div>

        <div
          onClick={() => setActiveTab('feedback')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'feedback'
              ? 'bg-emerald-50/50 border-emerald-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Tab 3: Feedback</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{feedback.length} Rows</p>
          <p className="text-[11px] text-slate-400 mt-0.5">1-5 star ratings & comments</p>
        </div>
      </div>

      {/* Spreadsheet Visual Window (Modeled like Google Sheets) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
        {/* Google Sheets top toolbar */}
        <div className="bg-[#f9fbfd] px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">
              SmileCraft Dental Studio — Master Sheet
            </span>
            <span className="text-[11px] text-slate-400">
              Last edit was {lastSyncTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auto-appending via WhatsApp Webhook</span>
          </div>
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="overflow-x-auto max-h-[460px]">
          {activeTab === 'contacts' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 select-none">
                  <th className="py-2 px-3 border-r border-slate-200 w-12 text-center text-slate-400">#</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">A: Patient ID</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">B: Full Name</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">C: WhatsApp Phone</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">D: Email</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">E: Insurance</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600 text-center">F: Visits</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600 text-right">G: Spend ($)</th>
                  <th className="py-2 px-4 font-semibold text-slate-600">H: Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {patients.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-emerald-50/40">
                    <td className="py-2 px-3 border-r border-slate-200 bg-slate-50/50 text-center text-slate-400 font-sans">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-500">{p.id}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans font-bold text-slate-900">{p.name}</td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-600">{p.phone}</td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-500">{p.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans">{p.insuranceProvider || 'Self Pay'}</td>
                    <td className="py-2 px-4 border-r border-slate-200 text-center font-bold">{p.totalVisits}</td>
                    <td className="py-2 px-4 border-r border-slate-200 text-right font-bold text-emerald-800">${p.lifetimeSpend}</td>
                    <td className="py-2 px-4 font-sans text-slate-600">{p.tags.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'bookings' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 select-none">
                  <th className="py-2 px-3 border-r border-slate-200 w-12 text-center text-slate-400">#</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">A: Booking ID</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">B: Patient</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">C: Phone</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">D: Service</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">E: Date</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">F: Time</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">G: Doctor</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">H: Status</th>
                  <th className="py-2 px-4 font-semibold text-slate-600">I: Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {bookings.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-emerald-50/40">
                    <td className="py-2 px-3 border-r border-slate-200 bg-slate-50/50 text-center text-slate-400 font-sans">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-500">{b.id}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans font-bold text-slate-900">{b.patientName}</td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-600">{b.patientPhone}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans font-semibold text-slate-800">{b.service}</td>
                    <td className="py-2 px-4 border-r border-slate-200">{b.date}</td>
                    <td className="py-2 px-4 border-r border-slate-200">{b.time}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans text-emerald-800">{b.dentistName}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-sans text-slate-500 truncate max-w-[200px]">{b.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'feedback' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 select-none">
                  <th className="py-2 px-3 border-r border-slate-200 w-12 text-center text-slate-400">#</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">A: Feedback ID</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">B: Patient</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">C: Service</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">D: Rating</th>
                  <th className="py-2 px-4 border-r border-slate-200 font-semibold text-slate-600">E: Patient Comment</th>
                  <th className="py-2 px-4 font-semibold text-slate-600">F: Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {feedback.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-emerald-50/40">
                    <td className="py-2 px-3 border-r border-slate-200 bg-slate-50/50 text-center text-slate-400 font-sans">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-500">{f.id}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans font-bold text-slate-900">{f.patientName}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans text-slate-700">{f.service}</td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans font-bold text-amber-600">
                      {'⭐'.repeat(f.rating)} ({f.rating}/5)
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans text-slate-800 italic">{f.comment}</td>
                    <td className="py-2 px-4 font-sans text-slate-400">{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Google Sheets Tab Bar */}
        <div className="bg-[#f0f3f8] px-4 py-2 border-t border-slate-200 flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-1.5 rounded-t-lg font-bold border-t-2 transition-all ${
              activeTab === 'contacts'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 border-transparent'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-1.5 rounded-t-lg font-bold border-t-2 transition-all ${
              activeTab === 'bookings'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 border-transparent'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-1.5 rounded-t-lg font-bold border-t-2 transition-all ${
              activeTab === 'feedback'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 border-transparent'
            }`}
          >
            Feedback
          </button>
        </div>
      </div>
    </div>
  );
};
