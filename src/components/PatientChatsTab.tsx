import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  PauseCircle,
  PlayCircle,
  Check,
  CheckCheck,
  Bot,
  User,
  Shield,
  Tag,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  MoreVertical,
  Paperclip,
  Smile,
  AlertCircle,
  FileText,
  UserCheck,
  CornerDownLeft
} from 'lucide-react';
import { ChatMessage, Conversation, Patient, Booking } from '../types';

interface PatientChatsTabProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  messages: Record<string, ChatMessage[]>;
  patients: Patient[];
  bookings: Booking[];
  onSendMessage: (conversationId: string, text: string) => void;
  onToggleBotPause: (conversationId: string) => void;
  onUpdatePatientNotes: (patientId: string, notes: string) => void;
  onAddPatientTag: (patientId: string, tag: string) => void;
  onRemovePatientTag: (patientId: string, tag: string) => void;
}

export const PatientChatsTab: React.FC<PatientChatsTabProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  messages,
  patients,
  bookings,
  onSendMessage,
  onToggleBotPause,
  onUpdatePatientNotes,
  onAddPatientTag,
  onRemovePatientTag
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'needs_attention'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [showPatientSidebar, setShowPatientSidebar] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activePatient = patients.find((p) => p.id === activeConv?.patientId);
  const activePatientBookings = bookings.filter((b) => b.patientId === activeConv?.patientId);
  const currentMessages = activeConv ? messages[activeConv.id] || [] : [];

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages, activeConversationId]);

  useEffect(() => {
    if (activePatient) {
      setNotesDraft(activePatient.notes);
    }
  }, [activePatient]);

  const filteredConversations = conversations.filter((conv) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'open'
        ? conv.status === 'open' || conv.status === 'needs_attention'
        : conv.status === filter;

    const matchesSearch =
      conv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.patientPhone.includes(searchQuery) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleQuickTemplate = (templateText: string) => {
    if (!activeConv) return;
    onSendMessage(activeConv.id, templateText);
  };

  const quickTemplates = [
    {
      title: 'Directions & Parking',
      text: '📍 Here are directions to SmileCraft Dental: 450 Sutter St, Suite 1400. You can park at the Sutter-Stockton garage across the street and we will validate your parking!'
    },
    {
      title: 'Pre-Visit Form',
      text: '📋 Before your visit, please ensure you bring your dental insurance card and photo ID. If you take regular medications, feel free to text a list here.'
    },
    {
      title: 'Doctor is Ready',
      text: '🦷 The operatory is sanitized and ready for you! You can head straight up to Suite 1400.'
    },
    {
      title: 'Reschedule Assistance',
      text: '🔄 Hi there! We see your reschedule request. Would Tomorrow at 2:30 PM or Friday at 11:15 AM work best for you?'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        {/* Left Pane: Conversations List */}
        <div className="w-full md:w-80 lg:w-84 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50 min-h-0">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">WhatsApp Inbox</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {conversations.length} chats
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, phone, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['all', 'open', 'needs_attention', 'resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    filter === tab
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs px-4">
                No conversations matching this filter
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.patientAvatar}
                        alt={conv.patientName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                      />
                      {conv.isBotPaused && (
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-xs"
                          title="Bot Paused - Staff Taken Over"
                        >
                          <PauseCircle className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.patientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mb-1">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {conv.status === 'needs_attention' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                            Needs Attention
                          </span>
                        )}
                        {conv.isBotPaused ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700">
                            Staff Reply
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <Bot className="w-2.5 h-2.5" />
                            Bot Active
                          </span>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Pane: Real WhatsApp Chat Thread */}
        <div className="flex-1 flex flex-col bg-[#efeae2] border-r border-slate-200 min-h-0 min-w-0">
          {activeConv ? (
            <>
              {/* WhatsApp Header */}
              <div className="px-4 py-3 bg-[#f0f2f5] border-b border-slate-300/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.patientAvatar}
                    alt={activeConv.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {activeConv.patientName}
                      </h3>
                      <span className="text-xs font-mono text-slate-500">
                        {activeConv.patientPhone}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Online via WhatsApp
                    </p>
                  </div>
                </div>

                {/* Bot Paused / Take Over Toggle Button & Profile Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPatientSidebar(!showPatientSidebar)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      showPatientSidebar
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    title="View Patient Clinical Profile & History"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden sm:inline">Profile & Notes</span>
                  </button>

                  <button
                    onClick={() => onToggleBotPause(activeConv.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      activeConv.isBotPaused
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={
                      activeConv.isBotPaused
                        ? 'Click to Resume Bot Auto-Replies for this patient'
                        : 'Click to Pause Bot & Take Over Chat manually'
                    }
                  >
                    {activeConv.isBotPaused ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume Bot</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Take Over Chat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bot status alert banner */}
              {activeConv.isBotPaused ? (
                <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Bot is paused for this patient.</strong> You are chatting directly as
                      clinic staff.
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleBotPause(activeConv.id)}
                    className="text-amber-900 font-bold hover:underline shrink-0 ml-2"
                  >
                    Turn Bot Back On
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50/80 px-4 py-1.5 border-b border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                    Bot is actively handling automated scheduling and FAQ replies.
                  </span>
                </div>
              )}

              {/* Messages Area with WhatsApp wallpaper */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 whatsapp-bg">
                {/* Encryption disclaimer badge */}
                <div className="flex justify-center my-2">
                  <span className="px-3 py-1 rounded-md bg-[#ffeecd] text-[#54656f] text-[11px] font-medium text-center shadow-xs max-w-sm">
                    🔒 Messages are end-to-end encrypted with WhatsApp Business API.
                  </span>
                </div>

                {currentMessages.map((msg) => {
                  const isPatient = msg.sender === 'patient';
                  const isAgent = msg.sender === 'agent';
                  const isBot = msg.sender === 'bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 shadow-xs text-xs relative ${
                          isPatient
                            ? 'bg-white text-slate-800 rounded-tl-xs'
                            : isAgent
                            ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-emerald-300'
                            : 'bg-[#e2f7cb] text-slate-900 rounded-tr-xs'
                        }`}
                      >
                        {/* Sender Label for Bot vs Staff */}
                        {!isPatient && (
                          <div className="flex items-center gap-1 text-[10px] font-bold mb-1">
                            {isAgent ? (
                              <span className="text-emerald-800 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {msg.senderName || 'Clinic Staff'}
                              </span>
                            ) : (
                              <span className="text-teal-700 flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                SmileCraft Virtual Assistant
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message body with line break formatting */}
                        <div className="whitespace-pre-line leading-relaxed">
                          {msg.text}
                        </div>

                        {/* Interactive list options if sent by bot */}
                        {msg.options && msg.options.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-300/40 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              Options sent:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {msg.options.map((opt, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-full bg-white/80 text-emerald-900 text-[10px] font-medium border border-emerald-300 shadow-2xs"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Timestamp & Read ticks */}
                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                          <span>{msg.timestamp}</span>
                          {!isPatient && (
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

              {/* Quick Reply Templates Bar */}
              <div className="px-3 py-1.5 bg-[#f0f2f5] border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">
                  Quick Reply:
                </span>
                {quickTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickTemplate(tmpl.text)}
                    className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 text-slate-700 transition-colors"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-[#f0f2f5] border-t border-slate-300/70 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={
                    activeConv.isBotPaused
                      ? 'Type reply as clinic staff (Press Enter to send)...'
                      : 'Type message to patient (Bot is active, will not interfere)...'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all shadow-xs"
                  title="Send WhatsApp message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation to view chat history
            </div>
          )}
        </div>

        {/* Right Pane: Patient CRM Profile (toggleable drawer) */}
        {showPatientSidebar && activePatient && (
          <div className="w-80 shrink-0 flex flex-col bg-white border-l border-slate-200 p-4 space-y-5 overflow-y-auto min-h-0 animate-in slide-in-from-right duration-150">
            {/* Header profile */}
              <div className="text-center pb-4 border-b border-slate-100">
                <img
                  src={activeConv?.patientAvatar}
                  alt={activePatient.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-emerald-500 shadow-sm"
                />
                <h3 className="text-sm font-extrabold text-slate-900 mt-2">
                  {activePatient.name}
                </h3>
                <p className="text-xs font-mono text-slate-500">{activePatient.phone}</p>
                {activePatient.email && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{activePatient.email}</p>
                )}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Visits</span>
                  <p className="text-lg font-black text-slate-900">{activePatient.totalVisits}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Insurance</span>
                  <p className="text-xs font-bold text-emerald-700 mt-1 truncate">
                    {activePatient.insuranceProvider || 'Self Pay'}
                  </p>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Patient Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activePatient.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => onRemovePatientTag(activePatient.id, tag)}
                        className="text-emerald-500 hover:text-emerald-800 text-[12px]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {/* Add Tag */}
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    placeholder="New tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault();
                        onAddPatientTag(activePatient.id, newTagInput.trim());
                        setNewTagInput('');
                      }
                    }}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => {
                      if (newTagInput.trim()) {
                        onAddPatientTag(activePatient.id, newTagInput.trim());
                        setNewTagInput('');
                      }
                    }}
                    className="px-2 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Internal Clinical Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Clinical Notes
                  </span>
                  <button
                    onClick={() => {
                      if (isEditingNotes) {
                        onUpdatePatientNotes(activePatient.id, notesDraft);
                      }
                      setIsEditingNotes(!isEditingNotes);
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    {isEditingNotes ? 'Save' : 'Edit'}
                  </button>
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={4}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  />
                ) : (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 italic leading-relaxed">
                    {activePatient.notes || 'No notes added yet.'}
                  </p>
                )}
              </div>

              {/* Recent Bookings */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Appointment History
                </span>
                {activePatientBookings.length === 0 ? (
                  <p className="text-xs text-slate-400">No appointments recorded</p>
                ) : (
                  <div className="space-y-2">
                    {activePatientBookings.map((bk) => (
                      <div
                        key={bk.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{bk.service}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              bk.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : bk.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {bk.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {bk.date} at {bk.time}
                        </p>
                        <p className="text-emerald-700 font-medium text-[10px]">
                          {bk.dentistName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
