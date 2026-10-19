import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Sparkles,
  Bot,
  RotateCcw,
  User,
  ChevronDown,
  Info,
  Smile,
  Paperclip,
  Mic,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { ChatMessage, Patient, ClinicSettings } from '../types';

interface WhatsAppSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentPatient: Patient;
  allPatients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onPatientSendMessage: (text: string) => void;
  onResetChat: (patientId: string) => void;
  clinicSettings: ClinicSettings;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  isOpen,
  onClose,
  messages,
  currentPatient,
  allPatients,
  onSelectPatient,
  onPatientSendMessage,
  onResetChat,
  clinicSettings
}) => {
  const [inputText, setInputText] = useState('');
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onPatientSendMessage(inputText.trim());
    setInputText('');
  };

  const handleOptionClick = (option: string) => {
    onPatientSendMessage(option);
  };

  const scenarios = [
    { label: 'Say "Hi" (Start Booking)', text: 'Hi, I would like to book an appointment' },
    { label: 'Select "Tooth pain"', text: 'Tooth pain' },
    { label: 'Select "Tomorrow 10:00 AM"', text: 'Tomorrow 10:00 AM' },
    { label: 'Provide Symptoms', text: 'Upper molar sharp pain when drinking cold drinks' },
    { label: 'Type "reschedule"', text: 'reschedule' },
    { label: 'Type "cancel"', text: 'cancel' },
    { label: 'Ask "What are your hours?"', text: 'What are your hours?' },
    { label: 'Leave 5-Star Review', text: '5 stars Dr. Jenkins was super gentle and pain-free!' }
  ];

  return (
    <div className="fixed top-16 bottom-0 right-0 z-30 w-full sm:w-[410px] bg-slate-900/40 backdrop-blur-xs flex justify-end shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Smartphone Device Frame */}
      <div className="w-full sm:w-[410px] h-full bg-[#111b21] flex flex-col shadow-2xl border-l border-slate-700/80 overflow-hidden">
        {/* Phone Top Notch / Status Bar */}
        <div className="bg-[#1f2c34] px-4 pt-2.5 pb-1 flex items-center justify-between text-slate-300 text-[11px] font-mono select-none">
          <span className="font-bold">9:41</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span className="w-4 h-2 rounded-xs border border-slate-300 relative inline-block">
              <span className="bg-emerald-400 absolute inset-0.5" />
            </span>
          </div>
        </div>

        {/* WhatsApp App Top Bar */}
        <div className="bg-[#1f2c34] px-3 py-2 flex items-center justify-between text-white border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-300 hover:text-white"
              title="Close Simulator"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs border border-emerald-400">
                🦷
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#1f2c34]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold truncate max-w-[170px] text-slate-100">
                  {clinicSettings.name}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[10px] text-emerald-400 font-medium">
                {currentPatient.isBotPaused ? 'Clinic Staff Online' : 'WhatsApp Bot 24/7 Online'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onResetChat(currentPatient.id)}
              className="p-1.5 rounded-full text-slate-400 hover:text-white"
              title="Reset Chat History for this Patient"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Switcher & Scenario Bar */}
        <div className="bg-[#2a3942] px-3 py-2 text-xs flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300 font-medium">Testing as:</span>
            <select
              value={currentPatient.id}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="bg-[#1f2c34] text-white text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-600 focus:outline-none"
            >
              {allPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsScenarioMenuOpen(!isScenarioMenuOpen)}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-[#1f2c34] px-2 py-1 rounded-md border border-emerald-500/30"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fast Scenarios</span>
          </button>
        </div>

        {/* Fast Scenarios Drawer / Popover */}
        {isScenarioMenuOpen && (
          <div className="bg-[#202c33] p-3 border-b border-slate-700 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>Quick Test Prompts (Tap to trigger):</span>
              <button
                onClick={() => setIsScenarioMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
              {scenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onPatientSendMessage(sc.text);
                    setIsScenarioMenuOpen(false);
                  }}
                  className="text-left text-[10px] font-medium p-1.5 rounded bg-[#111b21] hover:bg-emerald-950/60 text-slate-200 border border-slate-700 hover:border-emerald-500 transition-colors truncate"
                  title={sc.text}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Body with realistic WhatsApp wallpaper */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 whatsapp-bg">
          {/* Security Banner */}
          <div className="flex justify-center my-1">
            <span className="px-3 py-1 rounded-md bg-[#ffeecd] text-[#54656f] text-[10px] font-medium text-center shadow-2xs max-w-xs">
              🔒 Messages with {clinicSettings.name} are secured with end-to-end encryption.
            </span>
          </div>

          {messages.map((msg) => {
            const isPatient = msg.sender === 'patient';
            const isAgent = msg.sender === 'agent';
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-xs relative ${
                    isPatient
                      ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs'
                      : 'bg-white text-slate-900 rounded-tl-xs'
                  }`}
                >
                  {/* Sender title if staff */}
                  {!isPatient && (
                    <div className="text-[10px] font-bold mb-1">
                      {isAgent ? (
                        <span className="text-emerald-800 font-extrabold flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {msg.senderName || 'SmileCraft Staff'}
                        </span>
                      ) : (
                        <span className="text-teal-700 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          SmileCraft Booking Assistant
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text */}
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Interactive Option Pills for patient to tap */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        Select an option:
                      </p>
                      <div className="flex flex-col gap-1">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold border border-emerald-300 transition-colors flex items-center justify-between"
                          >
                            <span>{opt}</span>
                            <span className="text-emerald-600 text-xs font-bold">›</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp and Read checks */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {isPatient && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="bg-[#202c33] p-2 flex items-center gap-2 border-t border-slate-700"
        >
          <input
            type="text"
            placeholder="Type a message as patient..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#2a3942] text-white border border-transparent focus:border-emerald-500 focus:outline-none placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
            title="Send WhatsApp message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
