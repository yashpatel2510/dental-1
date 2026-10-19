import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Tag,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  Star,
  MessageSquare,
  MoreHorizontal,
  Download,
  Shield,
  Clock
} from 'lucide-react';
import { Patient, Booking, FeedbackItem } from '../types';

interface PatientsTabProps {
  patients: Patient[];
  bookings: Booking[];
  feedback: FeedbackItem[];
  onOpenChat: (patientId: string) => void;
  onUpdatePatientNotes: (patientId: string, notes: string) => void;
  onAddPatientTag: (patientId: string, tag: string) => void;
  onRemovePatientTag: (patientId: string, tag: string) => void;
  onAddNewPatient: (patient: Partial<Patient>) => void;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  patients,
  bookings,
  feedback,
  onOpenChat,
  onUpdatePatientNotes,
  onAddPatientTag,
  onRemovePatientTag,
  onAddNewPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // New patient modal state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newInsurance, setNewInsurance] = useState('Delta Dental Premier');
  const [newNotes, setNewNotes] = useState('');
  const [newTag, setNewTag] = useState('New Patient');

  // Edit notes drawer state
  const [notesEdit, setNotesEdit] = useState('');
  const [drawerTagInput, setDrawerTagInput] = useState('');

  const allTags = Array.from(new Set(patients.flatMap((p) => p.tags)));

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'all' || p.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNewPatient({
      name: newName,
      phone: newPhone,
      email: newEmail,
      insuranceProvider: newInsurance,
      notes: newNotes,
      tags: [newTag, 'In-Clinic Registered']
    });

    setIsNewPatientModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Insurance', 'Total Visits', 'Lifetime Spend ($)', 'Tags', 'Notes'];
    const rows = filteredPatients.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${p.phone}"`,
      `"${p.email || ''}"`,
      `"${p.insuranceProvider || 'Self Pay'}"`,
      p.totalVisits,
      p.lifetimeSpend,
      `"${p.tags.join(', ')}"`,
      `"${p.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smilecraft_patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Patients CRM & Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive patient directory with WhatsApp history, visit logs, insurance, and medical tags.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        {/* Search & Tag filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, email, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Tags:</span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({patients.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Insurance</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4 text-center">Visits</th>
                <th className="py-3.5 px-4 text-right">Lifetime Value</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No patients match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setNotesEdit(patient.notes);
                      }}
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              {patient.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Added {patient.createdAt}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-mono text-slate-900 font-semibold">{patient.phone}</p>
                          {patient.email && (
                            <p className="text-slate-400 text-[11px] truncate max-w-[160px]">
                              {patient.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Insurance */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          {patient.insuranceProvider || 'Self Pay'}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {patient.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Visits */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                          {patient.totalVisits}
                        </span>
                      </td>

                      {/* Spend */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ${patient.lifetimeSpend}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenChat(patient.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Open WhatsApp chat"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setNotesEdit(patient.notes);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="View patient history"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 text-lg font-bold flex items-center justify-center">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">{selectedPatient.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Contact & Insurance card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPatient.email || 'None on file'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Insurance Provider</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedPatient.insuranceProvider || 'Self Pay'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Completed Visits</span>
                  <span className="font-bold text-slate-900">{selectedPatient.totalVisits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lifetime Revenue</span>
                  <span className="font-bold text-emerald-800">${selectedPatient.lifetimeSpend}</span>
                </div>
              </div>

              {/* Tags Editor */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Patient Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => onRemovePatientTag(selectedPatient.id, tag)}
                        className="text-emerald-500 hover:text-emerald-900 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add custom tag (e.g. VIP, Anxious)..."
                    value={drawerTagInput}
                    onChange={(e) => setDrawerTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && drawerTagInput.trim()) {
                        e.preventDefault();
                        onAddPatientTag(selectedPatient.id, drawerTagInput.trim());
                        setDrawerTagInput('');
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                  <button
                    onClick={() => {
                      if (drawerTagInput.trim()) {
                        onAddPatientTag(selectedPatient.id, drawerTagInput.trim());
                        setDrawerTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Clinical Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Clinical & Behavioral Notes
                </span>
                <textarea
                  rows={4}
                  value={notesEdit}
                  onChange={(e) => setNotesEdit(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => onUpdatePatientNotes(selectedPatient.id, notesEdit)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Save Notes
                </button>
              </div>

              {/* Appointment History */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Appointment History
                </span>
                {bookings.filter((b) => b.patientId === selectedPatient.id).length === 0 ? (
                  <p className="text-xs text-slate-400">No booking history yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bookings
                      .filter((b) => b.patientId === selectedPatient.id)
                      .map((bk) => (
                        <div
                          key={bk.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{bk.service}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {bk.status}
                            </span>
                          </div>
                          <p className="text-slate-500">
                            {bk.date} at {bk.time} with {bk.dentistName}
                          </p>
                          {bk.feedbackRating && (
                            <p className="text-amber-700 font-semibold">
                              ⭐ {bk.feedbackRating}/5: "{bk.feedbackComment}"
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  onOpenChat(selectedPatient.id);
                  setSelectedPatient(null);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Patient Modal */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add New Patient</h3>
              <button
                onClick={() => setIsNewPatientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amanda Wright"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (415) 555-0182"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="amanda@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Insurance</label>
                <select
                  value={newInsurance}
                  onChange={(e) => setNewInsurance(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Delta Dental Premier">Delta Dental Premier</option>
                  <option value="Cigna Dental">Cigna Dental</option>
                  <option value="MetLife">MetLife</option>
                  <option value="Aetna">Aetna</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Self Pay">Self Pay / CareCredit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Tag</label>
                <input
                  type="text"
                  placeholder="e.g. VIP, Checkup Needed"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any known dental concerns or preferences..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
