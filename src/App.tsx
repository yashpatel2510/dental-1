import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { PatientChatsTab } from './components/PatientChatsTab';
import { BookingsTab } from './components/BookingsTab';
import { PatientsTab } from './components/PatientsTab';
import { BotFlowEditorTab } from './components/BotFlowEditorTab';
import { ClinicSettingsTab } from './components/ClinicSettingsTab';
import { GoogleSheetsTab } from './components/GoogleSheetsTab';
import { FeedbackTab } from './components/FeedbackTab';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { ConnectWhatsAppModal } from './components/ConnectWhatsAppModal';
import { BulkRemindersModal } from './components/BulkRemindersModal';
import { formatReminderMessage } from './utils/reminder-utils';

import {
  INITIAL_STAFF,
  INITIAL_CLINIC_SETTINGS,
  INITIAL_FLOW_STEPS,
  INITIAL_PATIENTS,
  INITIAL_BOOKINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEEDBACK
} from './data/mockData';

import {
  Patient,
  Booking,
  Conversation,
  ChatMessage,
  ClinicSettings,
  FlowStep,
  NotificationItem,
  FeedbackItem,
  StaffUser
} from './types';

import { processBotMessage, DEFAULT_REASONS } from './utils/bot-engine';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return false;
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isConnectWhatsAppModalOpen, setIsConnectWhatsAppModalOpen] = useState<boolean>(false);
  const [isBulkRemindersModalOpen, setIsBulkRemindersModalOpen] = useState<boolean>(false);

  // Core CRM data state
  const [staffUser] = useState<StaffUser>(INITIAL_STAFF);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(INITIAL_CLINIC_SETTINGS);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>(INITIAL_FLOW_STEPS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [feedback, setFeedback] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);

  // Selected chat and simulator patient
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [activeSimulatorPatientId, setActiveSimulatorPatientId] = useState<string>('pat-1');

  // Live Meta WhatsApp Cloud API connection status & synchronization
  const [isWhatsAppApiConnected, setIsWhatsAppApiConnected] = useState<boolean>(false);
  const [metaDiagnosis, setMetaDiagnosis] = useState<{ title: string; explanation: string; actionSteps?: string[] } | null>(null);
  const processedEventIdsRef = useRef<Set<string>>(new Set());

  // Simple Synthesizer Audio Chime for incoming booking / alert
  const playChime = useCallback(
    (type: 'alert' | 'message' | 'confirm') => {
      if (!isSoundEnabled || typeof window === 'undefined') return;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (type === 'alert') {
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'confirm') {
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        } else {
          osc.frequency.setValueAtTime(440, now); // A4
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        }
      } catch {
        // audio context blocked or not supported
      }
    },
    [isSoundEnabled]
  );

  // Helpers to get or create conversation for a patient
  const getOrCreateConversation = useCallback(
    (patient: Patient): Conversation => {
      let conv = conversations.find((c) => c.patientId === patient.id);
      if (!conv) {
        conv = {
          id: `conv-${patient.id}`,
          patientId: patient.id,
          patientName: patient.name,
          patientPhone: patient.phone,
          patientAvatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          lastMessage: 'Conversation started',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          status: 'open',
          isBotPaused: patient.isBotPaused,
          botStep: 'IDLE',
          botContext: {
            step: 'IDLE',
            patientName: patient.name,
            patientPhone: patient.phone
          }
        };
        setConversations((prev) => [conv!, ...prev]);
        setMessages((prev) => ({
          ...prev,
          [conv!.id]: []
        }));
      }
      return conv;
    },
    [conversations]
  );

  // Poll live events from backend WhatsApp Cloud API webhook
  useEffect(() => {
    let isMounted = true;
    const fetchLiveFeed = async () => {
      try {
        const res = await fetch('/api/whatsapp/live-feed');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        setIsWhatsAppApiConnected(Boolean(data.isConnected));
        if (data.lastError) {
          setMetaDiagnosis(data.lastError);
        } else {
          setMetaDiagnosis(null);
        }

        if (Array.isArray(data.events)) {
          for (const ev of data.events) {
            if (processedEventIdsRef.current.has(ev.id)) continue;
            processedEventIdsRef.current.add(ev.id);

            const cleanPhone = ev.phone ? ev.phone.replace(/[^0-9]/g, '') : '';
            const convId = `conv-real-${cleanPhone || 'anon'}`;

            // 1. Add patient if new
            setPatients((prev) => {
              const existing = prev.find((p) => p.phone.replace(/[^0-9]/g, '') === cleanPhone);
              if (!existing) {
                const newPat: Patient = {
                  id: `pat-real-${cleanPhone}`,
                  name: ev.senderName || `WhatsApp Patient (+${cleanPhone})`,
                  phone: ev.phone,
                  notes: 'Lead from Live WhatsApp Webhook',
                  tags: ['WhatsApp Lead', 'New Patient'],
                  createdAt: new Date().toISOString().slice(0, 10),
                  lastContactAt: 'Just now',
                  isBotPaused: false,
                  totalVisits: 0,
                  lifetimeSpend: 0,
                  status: 'active'
                };
                return [newPat, ...prev];
              }
              return prev;
            });

            // 2. Add message to chat list
            const newMsg: ChatMessage = {
              id: ev.id,
              conversationId: convId,
              sender: ev.sender,
              senderName: ev.senderName,
              text: ev.text,
              timestamp: ev.timestamp,
              status: 'delivered'
            };

            setMessages((prev) => ({
              ...prev,
              [convId]: [...(prev[convId] || []), newMsg]
            }));

            // 3. Update or create conversation
            setConversations((prev) => {
              const existing = prev.find((c) => c.id === convId);
              if (existing) {
                return prev.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        lastMessage: ev.text,
                        lastMessageTime: ev.timestamp,
                        unreadCount: ev.sender === 'patient' ? c.unreadCount + 1 : c.unreadCount
                      }
                    : c
                );
              } else {
                const newConv: Conversation = {
                  id: convId,
                  patientId: `pat-real-${cleanPhone}`,
                  patientName: ev.senderName || 'WhatsApp Patient',
                  patientPhone: ev.phone,
                  patientAvatar:
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  lastMessage: ev.text,
                  lastMessageTime: ev.timestamp,
                  unreadCount: ev.sender === 'patient' ? 1 : 0,
                  status: 'open',
                  isBotPaused: false,
                  botStep: 'IDLE',
                  botContext: {
                    step: 'IDLE',
                    patientName: ev.senderName || 'WhatsApp Patient',
                    patientPhone: ev.phone
                  }
                };
                return [newConv, ...prev];
              }
            });

            // 4. Inbound booking created by bot
            if (ev.action === 'create_booking' && ev.bookingData) {
              const newBooking: Booking = {
                id: `bk-real-${Date.now()}`,
                patientId: `pat-real-${cleanPhone}`,
                patientName: ev.bookingData.patientName || ev.senderName,
                patientPhone: ev.bookingData.patientPhone || ev.phone,
                service: ev.bookingData.service || 'Dental Consultation',
                date: ev.bookingData.date || new Date().toISOString().slice(0, 10),
                time: ev.bookingData.time || '10:00 AM',
                dentistId: clinicSettings.dentists[0]?.id || 'dentist-1',
                dentistName: clinicSettings.dentists[0]?.name || 'Dr. Sarah Lin',
                status: 'pending',
                notes: ev.bookingData.details || 'Booked via Real WhatsApp',
                reminder24hSent: false,
                reminder2hSent: false,
                createdAt: new Date().toISOString().slice(0, 10),
                fee: 120
              };
              setBookings((b) => [newBooking, ...b]);

              setNotifications((n) => [
                {
                  id: `notif-${Date.now()}`,
                  type: 'new_booking',
                  title: 'Real WhatsApp Booking Request!',
                  message: `${newBooking.patientName} requested ${newBooking.service} for ${newBooking.date} at ${newBooking.time}.`,
                  timestamp: 'Just now',
                  read: false,
                  linkTab: 'bookings',
                  patientName: newBooking.patientName
                },
                ...n
              ]);
              playChime('alert');
            }

            // 5. Inbound feedback
            if (ev.action === 'save_feedback' && ev.feedbackData) {
              setFeedback((f) => [
                {
                  id: `fb-real-${Date.now()}`,
                  patientId: `pat-real-${cleanPhone}`,
                  patientName: ev.senderName,
                  bookingId: 'real-visit',
                  service: 'Dental Treatment',
                  rating: ev.feedbackData.rating || 5,
                  comment: ev.feedbackData.comment || 'Submitted via WhatsApp',
                  date: new Date().toISOString().slice(0, 10),
                  verifiedVisit: true
                },
                ...f
              ]);
              playChime('confirm');
            }
          }
        }
      } catch {
        // silent fetch catch
      }
    };

    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [clinicSettings.dentists, playChime]);

  // Patient sends a message on WhatsApp Simulator
  const handlePatientSendMessage = useCallback(
    (text: string) => {
      const patient = patients.find((p) => p.id === activeSimulatorPatientId) || patients[0];
      const conv = getOrCreateConversation(patient);
      const convId = conv.id;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 1. Add patient message
      const patientMsg: ChatMessage = {
        id: `msg-${Date.now()}-patient`,
        conversationId: convId,
        sender: 'patient',
        text,
        timestamp,
        status: 'read'
      };

      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), patientMsg]
      }));

      // Update conversation last message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastMessage: text,
                lastMessageTime: timestamp,
                unreadCount: c.unreadCount + 1
              }
            : c
        )
      );

      // 2. Evaluate with Bot Engine
      const reasonStep = flowSteps.find((s) => s.key === 'reason_menu');
      const customReasons = reasonStep?.options || DEFAULT_REASONS;

      // Extract context data from patient answers if applicable
      const currentContext = { ...conv.botContext };
      if (currentContext.step === 'AWAITING_NAME') {
        currentContext.patientName = text;
      } else if (currentContext.step === 'AWAITING_PHONE') {
        currentContext.patientPhone = text.includes('Current')
          ? patient.phone
          : text;
      } else if (currentContext.step === 'AWAITING_REASON') {
        currentContext.reason = text;
      } else if (currentContext.step === 'AWAITING_DATETIME') {
        currentContext.preferredDate = text.split(' ')[0] || 'Tomorrow';
        currentContext.preferredTime = text.split(' ').slice(1).join(' ') || '10:00 AM';
      } else if (currentContext.step === 'AWAITING_DETAILS') {
        currentContext.details = text;
      }

      const botReply = processBotMessage(
        text,
        currentContext,
        conv.isBotPaused,
        customReasons,
        clinicSettings.faqs
      );

      // If bot is active and has a reply
      if (botReply.text) {
        setTimeout(() => {
          const botTimestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          const botMsg: ChatMessage = {
            id: `msg-${Date.now()}-bot`,
            conversationId: convId,
            sender: 'bot',
            text: botReply.text,
            timestamp: botTimestamp,
            status: 'read',
            options: botReply.options
          };

          setMessages((prev) => ({
            ...prev,
            [convId]: [...(prev[convId] || []), botMsg]
          }));

          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    lastMessage: botReply.text.slice(0, 60) + '...',
                    lastMessageTime: botTimestamp,
                    botStep: botReply.newStep,
                    botContext: {
                      ...currentContext,
                      step: botReply.newStep
                    }
                  }
                : c
            )
          );

          // Handle special bot actions
          if (botReply.action === 'create_booking' && botReply.bookingData) {
            const newBooking: Booking = {
              id: `bk-${Date.now()}`,
              patientId: patient.id,
              patientName: currentContext.patientName || patient.name,
              patientPhone: currentContext.patientPhone || patient.phone,
              service: currentContext.reason || 'General Checkup',
              date: currentContext.preferredDate || 'Tomorrow',
              time: currentContext.preferredTime || '10:00 AM',
              dentistId: clinicSettings.dentists[0]?.id || 'dentist-1',
              dentistName: clinicSettings.dentists[0]?.name || 'Dr. Sarah Jenkins',
              status: 'pending',
              notes: currentContext.details || 'Booked via WhatsApp bot',
              reminder24hSent: false,
              reminder2hSent: false,
              createdAt: `${new Date().toISOString().slice(0, 10)} ${botTimestamp}`,
              fee: 85
            };

            setBookings((prev) => [newBooking, ...prev]);

            // Add notification
            const notif: NotificationItem = {
              id: `notif-${Date.now()}`,
              type: 'new_booking',
              title: 'New WhatsApp Booking Request',
              message: `${newBooking.patientName} requested ${newBooking.service} for ${newBooking.date} at ${newBooking.time}.`,
              timestamp: 'Just now',
              read: false,
              linkTab: 'bookings',
              patientName: newBooking.patientName
            };

            setNotifications((prev) => [notif, ...prev]);
            playChime('alert');
          } else if (botReply.action === 'request_reschedule') {
            // Find patient's latest booking
            setBookings((prev) =>
              prev.map((b) =>
                b.patientId === patient.id
                  ? {
                      ...b,
                      status: 'rescheduled_pending',
                      previousSlot: { date: b.date, time: b.time },
                      notes: `Patient requested reschedule to ${text}`
                    }
                  : b
              )
            );

            const notif: NotificationItem = {
              id: `notif-${Date.now()}`,
              type: 'reschedule_request',
              title: 'Reschedule Request',
              message: `${patient.name} requested rescheduling to ${text}.`,
              timestamp: 'Just now',
              read: false,
              linkTab: 'bookings',
              patientName: patient.name
            };

            setNotifications((prev) => [notif, ...prev]);
            playChime('alert');
          } else if (botReply.action === 'cancel_booking') {
            setBookings((prev) =>
              prev.map((b) =>
                b.patientId === patient.id && b.status !== 'completed'
                  ? { ...b, status: 'cancelled' }
                  : b
              )
            );
          } else if (botReply.action === 'save_feedback' && botReply.feedbackData) {
            const newFeedback: FeedbackItem = {
              id: `fb-${Date.now()}`,
              patientId: patient.id,
              patientName: patient.name,
              bookingId: 'bk-recent',
              service: 'Dental Care Visit',
              rating: botReply.feedbackData.rating,
              comment: botReply.feedbackData.comment,
              date: new Date().toISOString().slice(0, 10),
              verifiedVisit: true
            };
            setFeedback((prev) => [newFeedback, ...prev]);
            playChime('confirm');
          }
        }, 600);
      }
    },
    [
      activeSimulatorPatientId,
      patients,
      getOrCreateConversation,
      flowSteps,
      clinicSettings,
      playChime
    ]
  );

  // Staff sends a message from CRM PatientChats
  const handleStaffSendMessage = (conversationId: string, text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const staffMsg: ChatMessage = {
      id: `msg-${Date.now()}-staff`,
      conversationId,
      sender: 'agent',
      senderName: `${staffUser.name} (${staffUser.role})`,
      text,
      timestamp,
      status: 'delivered'
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), staffMsg]
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: `[${staffUser.name}]: ${text}`,
              lastMessageTime: timestamp,
              unreadCount: 0
            }
          : c
      )
    );

    // Forward outbound message to real WhatsApp Cloud API if recipient has phone
    const targetConv = conversations.find((c) => c.id === conversationId);
    if (targetConv?.patientPhone) {
      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: targetConv.patientPhone,
          text,
          senderName: staffUser.name
        })
      }).catch(() => {});
    }

    playChime('message');
  };

  // Staff toggles "Pause Bot / Take Over" for a conversation
  const handleToggleBotPause = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const newPaused = !c.isBotPaused;
          // Also update corresponding patient state
          setPatients((patList) =>
            patList.map((p) => (p.id === c.patientId ? { ...p, isBotPaused: newPaused } : p))
          );
          return { ...c, isBotPaused: newPaused };
        }
        return c;
      })
    );
  };

  // Staff approves a pending booking
  const handleApproveBooking = (bookingId: string) => {
    const bk = bookings.find((b) => b.id === bookingId);
    if (!bk) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
    );

    // Send WhatsApp confirmation message into patient's chat
    const patient = patients.find((p) => p.id === bk.patientId) || {
      id: bk.patientId,
      name: bk.patientName,
      phone: bk.patientPhone,
      notes: '',
      tags: [],
      createdAt: '2026-10-18',
      lastContactAt: 'Now',
      isBotPaused: false,
      totalVisits: 1,
      lifetimeSpend: 0,
      status: 'active' as const
    };

    const conv = getOrCreateConversation(patient);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const approvalTemplate = flowSteps.find((s) => s.key === 'admin_approved')?.messageTemplate ||
      '✅ *Appointment Confirmed!*\n\nGreat news *{patient_name}*! Your visit with *{dentist_name}* is officially confirmed:\n📅 *Date & Time:* {slot}\n📍 *Location:* SmileCraft Dental, Suite 1400\n\nPlease arrive 10 minutes early. Type *Reschedule* or *Cancel* anytime if needed.';

    const confirmationText = approvalTemplate
      .replace('{patient_name}', bk.patientName)
      .replace('{dentist_name}', bk.dentistName)
      .replace('{slot}', `${bk.date} at ${bk.time}`);

    const approvalMsg: ChatMessage = {
      id: `msg-${Date.now()}-approval`,
      conversationId: conv.id,
      sender: 'agent',
      senderName: `${staffUser.name} (Approved in CRM)`,
      text: confirmationText,
      timestamp,
      status: 'delivered'
    };

    setMessages((prev) => ({
      ...prev,
      [conv.id]: [...(prev[conv.id] || []), approvalMsg]
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? {
              ...c,
              lastMessage: 'Appointment Confirmed by staff!',
              lastMessageTime: timestamp,
              status: 'open'
            }
          : c
      )
    );

    // Send to real patient WhatsApp if phone number exists
    if (bk.patientPhone) {
      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPhone: bk.patientPhone,
          text: confirmationText,
          senderName: `${staffUser.name} (DentPulse CRM)`
        })
      }).catch(() => {});
    }

    playChime('confirm');
  };

  // Staff declines a booking
  const handleDeclineBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'declined' } : b))
    );
  };

  // Staff reschedules a booking
  const handleRescheduleBooking = (bookingId: string, newDate: string, newTime: string) => {
    const bk = bookings.find((b) => b.id === bookingId);
    if (!bk) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              time: newTime,
              status: 'confirmed',
              previousSlot: undefined
            }
          : b
      )
    );

    const patient = patients.find((p) => p.id === bk.patientId);
    if (patient) {
      const conv = getOrCreateConversation(patient);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msg: ChatMessage = {
        id: `msg-${Date.now()}-rescheduled`,
        conversationId: conv.id,
        sender: 'agent',
        senderName: `${staffUser.name} (Clinic Staff)`,
        text: `🔄 *Reschedule Confirmed!*\n\nHi ${bk.patientName}, your appointment has been updated to:\n📅 *${newDate} at ${newTime}*\nDoctor: ${bk.dentistName}\n\nWe look forward to seeing you!`,
        timestamp,
        status: 'delivered'
      };

      setMessages((prev) => ({
        ...prev,
        [conv.id]: [...(prev[conv.id] || []), msg]
      }));
    }

    playChime('confirm');
  };

  // Staff cancels a booking
  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  // Staff marks a visit completed -> triggers automated WhatsApp feedback request
  const handleMarkCompleted = (bookingId: string) => {
    const bk = bookings.find((b) => b.id === bookingId);
    if (!bk) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
    );

    const patient = patients.find((p) => p.id === bk.patientId);
    if (patient) {
      // Increment total visits
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patient.id
            ? { ...p, totalVisits: p.totalVisits + 1, lifetimeSpend: p.lifetimeSpend + bk.fee }
            : p
        )
      );

      const conv = getOrCreateConversation(patient);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const feedbackTemplate = flowSteps.find((s) => s.key === 'feedback_flow')?.messageTemplate ||
        '🌟 *How was your visit with us today?*\n\nReply with a rating from **1 to 5 stars** (e.g. "5 stars - painless clean!") and any quick comments. We love hearing from you! 🦷';

      const promptMsg: ChatMessage = {
        id: `msg-${Date.now()}-fb-prompt`,
        conversationId: conv.id,
        sender: 'bot',
        text: feedbackTemplate,
        timestamp,
        status: 'read',
        options: ['⭐⭐⭐⭐⭐ 5 Stars', '⭐⭐⭐⭐ 4 Stars', '⭐⭐⭐ 3 Stars']
      };

      setMessages((prev) => ({
        ...prev,
        [conv.id]: [...(prev[conv.id] || []), promptMsg]
      }));

      // Set bot state to await feedback rating
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                botStep: 'AWAITING_FEEDBACK',
                botContext: { ...c.botContext, step: 'AWAITING_FEEDBACK' },
                lastMessage: 'Requested post-visit feedback rating',
                lastMessageTime: timestamp
              }
            : c
        )
      );

      playChime('message');
    }
  };

  // Staff triggers 24h or 2h WhatsApp reminder template
  const handleSendReminder = (bookingId: string, type: '24h' | '2h') => {
    const bk = bookings.find((b) => b.id === bookingId);
    if (!bk) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              reminder24hSent: type === '24h' ? true : b.reminder24hSent,
              reminder2hSent: type === '2h' ? true : b.reminder2hSent
            }
          : b
      )
    );

    const patient = patients.find((p) => p.id === bk.patientId);
    if (patient) {
      const conv = getOrCreateConversation(patient);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const text =
        type === '24h'
          ? `⏰ *24h Appointment Reminder:*\nHi ${bk.patientName}, this is a reminder for your dental appointment tomorrow at *${bk.time}* with ${bk.dentistName} at SmileCraft Dental.\n\nReply *1* to Confirm or *Reschedule* if needed.`
          : `🔔 *2h Reminder:*\nHi ${bk.patientName}, your dental visit starts in 2 hours at *${bk.time}*. Parking is available at 450 Sutter St. See you soon!`;

      const reminderMsg: ChatMessage = {
        id: `msg-${Date.now()}-reminder-${type}`,
        conversationId: conv.id,
        sender: 'bot',
        text,
        timestamp,
        status: 'delivered',
        options: ['1. Confirm', 'Reschedule']
      };

      setMessages((prev) => ({
        ...prev,
        [conv.id]: [...(prev[conv.id] || []), reminderMsg]
      }));

      // Send to real WhatsApp if configured
      if (bk.patientPhone) {
        fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toPhone: bk.patientPhone,
            text,
            senderName: 'DentPulse Reminders'
          })
        }).catch(() => {});
      }

      playChime('message');
    }
  };

  // Staff triggers bulk 48h WhatsApp reminders
  const handleSendBulkReminders = async (
    selectedBookingIds: string[],
    template: string
  ): Promise<{ success: boolean; sentCount: number }> => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const remindersPayload: Array<{ toPhone: string; patientName: string; text: string }> = [];

    // Mark selected bookings as reminded
    setBookings((prev) =>
      prev.map((b) =>
        selectedBookingIds.includes(b.id)
          ? { ...b, reminder24hSent: true }
          : b
      )
    );

    for (const bId of selectedBookingIds) {
      const bk = bookings.find((b) => b.id === bId);
      if (!bk) continue;

      const patient = patients.find((p) => p.id === bk.patientId) || {
        id: bk.patientId,
        name: bk.patientName,
        phone: bk.patientPhone,
        notes: '',
        tags: [],
        createdAt: '2026-10-18',
        lastContactAt: 'Now',
        isBotPaused: false,
        totalVisits: 1,
        lifetimeSpend: 0,
        status: 'active' as const
      };

      const conv = getOrCreateConversation(patient);
      const reminderText = formatReminderMessage(
        template,
        {
          patientName: bk.patientName,
          dentistName: bk.dentistName,
          date: bk.date,
          time: bk.time,
          service: bk.service
        },
        clinicSettings.name
      );

      const reminderMsg: ChatMessage = {
        id: `msg-${Date.now()}-bulk-${bId}`,
        conversationId: conv.id,
        sender: 'bot',
        text: reminderText,
        timestamp,
        status: 'delivered',
        options: ['1. Confirm', 'Reschedule']
      };

      setMessages((prev) => ({
        ...prev,
        [conv.id]: [...(prev[conv.id] || []), reminderMsg]
      }));

      // Update conversation last message in inbox
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                lastMessage: '⏰ 24h WhatsApp Reminder sent',
                lastMessageTime: timestamp
              }
            : c
        )
      );

      remindersPayload.push({
        toPhone: bk.patientPhone,
        patientName: bk.patientName,
        text: reminderText
      });
    }

    // Call backend endpoint to forward to Meta Cloud API if configured
    try {
      await fetch('/api/whatsapp/bulk-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminders: remindersPayload })
      });
    } catch {
      // safe fallback
    }

    // Activity notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'reminder_dispatched',
      title: 'Bulk WhatsApp Reminders Dispatched',
      message: `Successfully delivered 48-hour appointment reminders to ${selectedBookingIds.length} patients.`,
      timestamp: 'Just now',
      read: false,
      linkTab: 'bookings'
    };
    setNotifications((prev) => [notif, ...prev]);

    playChime('confirm');

    return { success: true, sentCount: selectedBookingIds.length };
  };

  // Quick action: Patient directory updates
  const handleUpdatePatientNotes = (patientId: string, notes: string) => {
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, notes } : p)));
  };

  const handleAddPatientTag = (patientId: string, tag: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId && !p.tags.includes(tag) ? { ...p, tags: [...p.tags, tag] } : p))
    );
  };

  const handleRemovePatientTag = (patientId: string, tag: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, tags: p.tags.filter((t) => t !== tag) } : p
      )
    );
  };

  const handleAddNewPatient = (partial: Partial<Patient>) => {
    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      name: partial.name || 'New Patient',
      phone: partial.phone || '+1 (415) 555-0100',
      email: partial.email,
      insuranceProvider: partial.insuranceProvider || 'Self Pay',
      notes: partial.notes || '',
      tags: partial.tags || ['New Patient'],
      createdAt: new Date().toISOString().slice(0, 10),
      lastContactAt: 'Just now',
      isBotPaused: false,
      totalVisits: 0,
      lifetimeSpend: 0,
      status: 'active'
    };

    setPatients((prev) => [newPat, ...prev]);
  };

  const handleResetChat = (patientId: string) => {
    const conv = conversations.find((c) => c.patientId === patientId);
    if (!conv) return;

    setMessages((prev) => ({
      ...prev,
      [conv.id]: [
        {
          id: `msg-reset-${Date.now()}`,
          conversationId: conv.id,
          sender: 'bot',
          text: '👋 *Welcome to SmileCraft Dental Clinic!*\n\nI am your 24/7 WhatsApp booking assistant. Type *Hi* or tap an option to begin.',
          timestamp: 'Just now',
          status: 'read',
          options: ['Book Appointment', 'Clinic Hours', 'Location']
        }
      ]
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? {
              ...c,
              botStep: 'IDLE',
              botContext: { step: 'IDLE', patientName: c.patientName, patientPhone: c.patientPhone },
              lastMessage: 'Chat restarted',
              lastMessageTime: 'Just now'
            }
          : c
      )
    );
  };

  const handleOpenChatForPatient = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    const conv = getOrCreateConversation(patient);
    setActiveConversationId(conv.id);
    setActiveTab('chats');
  };

  const currentSimulatorPatient =
    patients.find((p) => p.id === activeSimulatorPatientId) || patients[0];
  const currentSimulatorConv = conversations.find(
    (c) => c.patientId === currentSimulatorPatient.id
  ) || conversations[0];
  const currentSimulatorMessages = currentSimulatorConv
    ? messages[currentSimulatorConv.id] || []
    : [];

  const unreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'rescheduled_pending'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onMarkNotificationRead={(id) =>
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        }
        onClearAllNotifications={() => setNotifications([])}
        staffUser={staffUser}
        unreadChatCount={unreadChatCount}
        pendingBookingsCount={pendingBookingsCount}
        isSimulatorOpen={isSimulatorOpen}
        setIsSimulatorOpen={setIsSimulatorOpen}
        isSoundEnabled={isSoundEnabled}
        setIsSoundEnabled={setIsSoundEnabled}
        onOpenConnectWhatsApp={() => setIsConnectWhatsAppModalOpen(true)}
        isWhatsAppConnected={isWhatsAppApiConnected}
      />

      {/* Main CRM Content Area */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 transition-all duration-200 ${
          isSimulatorOpen ? 'lg:pr-[420px]' : ''
        }`}
      >
        {metaDiagnosis && (
          <div className="mb-4 p-3.5 bg-amber-50/95 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs animate-in fade-in">
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="px-2 py-0.5 bg-amber-200/80 rounded-md text-amber-900 font-bold shrink-0 text-[10px] uppercase tracking-wider mt-0.5 sm:mt-0">
                Meta Status
              </span>
              <div>
                <span className="font-bold">{metaDiagnosis.title}: </span>
                <span className="text-amber-800">{metaDiagnosis.explanation}</span>
              </div>
            </div>
            <button
              onClick={() => setIsConnectWhatsAppModalOpen(true)}
              className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl transition-colors shrink-0 self-end sm:self-auto"
            >
              Update Credentials
            </button>
          </div>
        )}
        {activeTab === 'overview' && (
          <OverviewTab
            bookings={bookings}
            conversations={conversations}
            feedback={feedback}
            patients={patients}
            onApproveBooking={handleApproveBooking}
            onDeclineBooking={handleDeclineBooking}
            onSelectConversation={(convId) => {
              setActiveConversationId(convId);
              setActiveTab('chats');
            }}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onNavigateTab={setActiveTab}
            onOpenConnectWhatsApp={() => setIsConnectWhatsAppModalOpen(true)}
            onOpenBulkReminders={() => setIsBulkRemindersModalOpen(true)}
            isWhatsAppConnected={isWhatsAppApiConnected}
          />
        )}

        {activeTab === 'chats' && (
          <PatientChatsTab
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            messages={messages}
            patients={patients}
            bookings={bookings}
            onSendMessage={handleStaffSendMessage}
            onToggleBotPause={handleToggleBotPause}
            onUpdatePatientNotes={handleUpdatePatientNotes}
            onAddPatientTag={handleAddPatientTag}
            onRemovePatientTag={handleRemovePatientTag}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab
            bookings={bookings}
            dentists={clinicSettings.dentists}
            services={clinicSettings.services}
            onApprove={handleApproveBooking}
            onDecline={handleDeclineBooking}
            onReschedule={handleRescheduleBooking}
            onCancel={handleCancelBooking}
            onMarkCompleted={handleMarkCompleted}
            onSendReminder={handleSendReminder}
            onOpenChat={handleOpenChatForPatient}
            onOpenBulkReminders={() => setIsBulkRemindersModalOpen(true)}
            onCreateManualBooking={(newBk) => {
              const created: Booking = {
                id: `bk-${Date.now()}`,
                patientId: `pat-${Date.now()}`,
                patientName: newBk.patientName || 'New Patient',
                patientPhone: newBk.patientPhone || '+1 (415) 555-0100',
                service: newBk.service || 'Checkup',
                date: newBk.date || '2026-10-19',
                time: newBk.time || '10:00 AM',
                dentistId: newBk.dentistId || clinicSettings.dentists[0]?.id || 'dentist-1',
                dentistName: newBk.dentistName || 'Dr. Sarah Jenkins',
                status: 'confirmed',
                notes: newBk.notes,
                reminder24hSent: false,
                reminder2hSent: false,
                createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                fee: newBk.fee || 100
              };
              setBookings((prev) => [created, ...prev]);
            }}
          />
        )}

        {activeTab === 'patients' && (
          <PatientsTab
            patients={patients}
            bookings={bookings}
            feedback={feedback}
            onOpenChat={handleOpenChatForPatient}
            onUpdatePatientNotes={handleUpdatePatientNotes}
            onAddPatientTag={handleAddPatientTag}
            onRemovePatientTag={handleRemovePatientTag}
            onAddNewPatient={handleAddNewPatient}
          />
        )}

        {activeTab === 'flow' && (
          <BotFlowEditorTab
            flowSteps={flowSteps}
            onSaveFlowSteps={(newSteps) => setFlowSteps(newSteps)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsTab
            patients={patients}
            bookings={bookings}
            feedback={feedback}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackTab
            feedback={feedback}
            completedBookingsWithoutFeedback={bookings.filter(
              (b) => b.status === 'completed' && !b.feedbackRating
            )}
            onRequestFeedback={(bkId) => handleMarkCompleted(bkId)}
          />
        )}

        {activeTab === 'settings' && (
          <ClinicSettingsTab
            settings={clinicSettings}
            onSaveSettings={(newSettings) => setClinicSettings(newSettings)}
            onOpenConnectWhatsApp={() => setIsConnectWhatsAppModalOpen(true)}
          />
        )}
      </main>

      {/* Floating or Docked WhatsApp Patient Simulator */}
      <WhatsAppSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        messages={currentSimulatorMessages}
        currentPatient={currentSimulatorPatient}
        allPatients={patients}
        onSelectPatient={(id) => {
          setActiveSimulatorPatientId(id);
          const p = patients.find((pat) => pat.id === id);
          if (p) {
            const conv = getOrCreateConversation(p);
            setActiveConversationId(conv.id);
          }
        }}
        onPatientSendMessage={handlePatientSendMessage}
        onResetChat={handleResetChat}
        clinicSettings={clinicSettings}
      />

      {/* Connect Real WhatsApp Modal Setup Wizard */}
      <ConnectWhatsAppModal
        isOpen={isConnectWhatsAppModalOpen}
        onClose={() => setIsConnectWhatsAppModalOpen(false)}
      />

      {/* Bulk WhatsApp Reminders Modal (Next 48 Hours) */}
      <BulkRemindersModal
        isOpen={isBulkRemindersModalOpen}
        onClose={() => setIsBulkRemindersModalOpen(false)}
        bookings={bookings}
        patients={patients}
        clinicName={clinicSettings.name}
        onSendBulkReminders={handleSendBulkReminders}
      />
    </div>
  );
}
