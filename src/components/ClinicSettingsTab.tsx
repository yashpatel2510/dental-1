import React, { useState } from 'react';
import {
  Settings,
  Clock,
  UserPlus,
  DollarSign,
  HelpCircle,
  Save,
  Trash2,
  Plus,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  Bell
} from 'lucide-react';
import { ClinicSettings, Dentist, DentalService, ClinicFaqItem } from '../types';

interface ClinicSettingsTabProps {
  settings: ClinicSettings;
  onSaveSettings: (settings: ClinicSettings) => void;
  onOpenConnectWhatsApp: () => void;
}

export const ClinicSettingsTab: React.FC<ClinicSettingsTabProps> = ({
  settings,
  onSaveSettings,
  onOpenConnectWhatsApp
}) => {
  const [formData, setFormData] = useState<ClinicSettings>(settings);
  const [activeSubSection, setActiveSubSection] = useState<'general' | 'dentists' | 'services' | 'faqs'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Dentist Modal / Row
  const [newDentistName, setNewDentistName] = useState('');
  const [newDentistSpecialty, setNewDentistSpecialty] = useState('');
  const [newDentistRoom, setNewDentistRoom] = useState('Operatory 1');

  // New Service Row
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(90);
  const [newServiceDuration, setNewServiceDuration] = useState(45);
  const [newServiceCategory, setNewServiceCategory] = useState<'Preventative' | 'Restorative' | 'Cosmetic' | 'Surgical' | 'Orthodontics'>('Preventative');

  // New FAQ Row
  const [newFaqKeywords, setNewFaqKeywords] = useState('');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddDentist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDentistName.trim()) return;
    const newDoc: Dentist = {
      id: `dentist-${Date.now()}`,
      name: newDentistName.trim(),
      role: 'Associate Dentist',
      specialty: newDentistSpecialty.trim() || 'General Dentistry',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      room: newDentistRoom
    };
    setFormData((prev) => ({
      ...prev,
      dentists: [...prev.dentists, newDoc]
    }));
    setNewDentistName('');
    setNewDentistSpecialty('');
  };

  const handleDeleteDentist = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dentists: prev.dentists.filter((d) => d.id !== id)
    }));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const newSrv: DentalService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory,
      durationMinutes: newServiceDuration,
      price: newServicePrice,
      description: 'Standard in-clinic dental procedure.'
    };
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, newSrv]
    }));
    setNewServiceName('');
    setNewServicePrice(90);
  };

  const handleDeleteService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id)
    }));
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const item: ClinicFaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      keywords: newFaqKeywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean)
    };
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, item]
    }));
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setNewFaqKeywords('');
  };

  const handleDeleteFaq = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Clinic Configuration & WhatsApp Bot Rules
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your clinic details, dentist rosters, services pricing, operating hours, and bot FAQ triggers.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Clinic settings and automated rules updated!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubSection('general')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubSection === 'general'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          General & Hours
        </button>
        <button
          onClick={() => setActiveSubSection('dentists')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubSection === 'dentists'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dentists Roster ({formData.dentists.length})
        </button>
        <button
          onClick={() => setActiveSubSection('services')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubSection === 'services'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Services & Pricing ({formData.services.length})
        </button>
        <button
          onClick={() => setActiveSubSection('faqs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubSection === 'faqs'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bot FAQs & Keywords ({formData.faqs.length})
        </button>
      </div>

      {/* Section 1: General & Hours */}
      {activeSubSection === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Clinic Contact & Meta Identity
            </h3>

            {/* Live WhatsApp Integration Card */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-xs text-emerald-950 block">
                  Real WhatsApp Cloud API Gateway
                </span>
                <span className="text-[11px] text-emerald-800">
                  Configure live Webhooks, Phone Number ID, and System Access Tokens.
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenConnectWhatsApp}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs shrink-0 transition-colors"
              >
                Configure
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Business Number (Receives patient chats)
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Notification WhatsApp (Alerts staff on new booking/reschedule)
              </label>
              <input
                type="text"
                value={formData.adminNotificationPhone}
                onChange={(e) =>
                  setFormData({ ...formData, adminNotificationPhone: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono text-emerald-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Appointment Scheduling Rules</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Slot Length (Duration)
              </label>
              <select
                value={formData.slotDurationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, slotDurationMinutes: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Recommended)</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operating Days
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => {
                    const isSelected = formData.workDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          const newDays = isSelected
                            ? formData.workDays.filter((d) => d !== day)
                            : [...formData.workDays, day];
                          setFormData({ ...formData, workDays: newDays });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <Bell className="w-3.5 h-3.5 text-emerald-700" />
                Automatic 24h & 2h Reminder Bot
              </p>
              <p className="text-[11px] text-emerald-800">
                Scheduled server cron triggers check upcoming appointments and dispatch
                automated WhatsApp confirmation reminders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Dentists */}
      {activeSubSection === 'dentists' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.dentists.map((dentist) => (
              <div
                key={dentist.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3 relative group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={dentist.avatar}
                    alt={dentist.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{dentist.name}</h4>
                    <p className="text-xs text-emerald-700 font-semibold">{dentist.specialty}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{dentist.room}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Days: {dentist.availableDays.length}</span>
                  <button
                    onClick={() => handleDeleteDentist(dentist.id)}
                    className="text-slate-400 hover:text-rose-600 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Dentist Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Add New Dentist / Specialist
            </h4>
            <form onSubmit={handleAddDentist} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Doctor Name (e.g. Dr. Alex Wong, DDS)"
                value={newDentistName}
                onChange={(e) => setNewDentistName(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
              <input
                type="text"
                placeholder="Specialty (e.g. Periodontics)"
                value={newDentistSpecialty}
                onChange={(e) => setNewDentistSpecialty(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
              <input
                type="text"
                placeholder="Room / Operatory (e.g. Operatory 4)"
                value={newDentistRoom}
                onChange={(e) => setNewDentistRoom(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Add Doctor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Section 3: Services */}
      {activeSubSection === 'services' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Fee ($)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {formData.services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{srv.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                        {srv.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{srv.durationMinutes} mins</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">${srv.price}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="text-slate-400 hover:text-rose-600 font-bold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Service */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Add New Dental Procedure
            </h4>
            <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                required
                placeholder="Procedure Name (e.g. Night Guard Fitting)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 sm:col-span-2"
              />
              <select
                value={newServiceCategory}
                onChange={(e: any) => setNewServiceCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="Preventative">Preventative</option>
                <option value="Restorative">Restorative</option>
                <option value="Cosmetic">Cosmetic</option>
                <option value="Surgical">Surgical</option>
                <option value="Orthodontics">Orthodontics</option>
              </select>
              <input
                type="number"
                min="0"
                placeholder="Price ($)"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(parseInt(e.target.value, 10) || 0)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Add Procedure
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Section 4: FAQs */}
      {activeSubSection === 'faqs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900">{faq.question}</h4>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-600 whitespace-pre-line leading-relaxed font-mono">
                  {faq.answer}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Keywords:
                  </span>
                  {faq.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add FAQ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Add Automatic Bot FAQ Answer
            </h4>
            <form onSubmit={handleAddFaq} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Question title (e.g. Do you accept walk-ins?)"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
                <input
                  type="text"
                  required
                  placeholder="Trigger Keywords comma-separated (e.g. walk-in, walk in, same day)"
                  value={newFaqKeywords}
                  onChange={(e) => setNewFaqKeywords(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <textarea
                rows={3}
                required
                placeholder="WhatsApp formatted response answer..."
                value={newFaqAnswer}
                onChange={(e) => setNewFaqAnswer(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono leading-relaxed"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Save FAQ Rule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
