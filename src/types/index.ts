export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled_pending'
  | 'completed'
  | 'cancelled'
  | 'declined';

export interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  service: string;
  date: string;
  time: string;
  dentistId: string;
  dentistName: string;
  status: BookingStatus;
  notes?: string;
  previousSlot?: {
    date: string;
    time: string;
  };
  reminder24hSent: boolean;
  reminder2hSent: boolean;
  createdAt: string;
  fee: number;
  feedbackRating?: number;
  feedbackComment?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes: string;
  tags: string[];
  createdAt: string;
  lastContactAt: string;
  isBotPaused: boolean;
  totalVisits: number;
  lifetimeSpend: number;
  insuranceProvider?: string;
  status: 'active' | 'follow_up' | 'archived';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'patient' | 'bot' | 'agent';
  senderName?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  messageType?: 'text' | 'menu' | 'quick_reply' | 'template' | 'system';
  options?: string[];
  actionPayload?: any;
}

export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'open' | 'resolved' | 'needs_attention';
  isBotPaused: boolean;
  botStep: string;
  botContext: {
    step: string;
    patientName?: string;
    patientPhone?: string;
    reason?: string;
    preferredDate?: string;
    preferredTime?: string;
    details?: string;
  };
}

export interface FlowStep {
  id: string;
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  messageTemplate: string;
  options?: string[];
  order: number;
}

export interface Dentist {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  availableDays: string[];
  room: string;
}

export interface DentalService {
  id: string;
  name: string;
  category: 'Preventative' | 'Restorative' | 'Cosmetic' | 'Surgical' | 'Orthodontics';
  durationMinutes: number;
  price: number;
  description: string;
  dentistId?: string;
}

export interface ClinicFaqItem {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

export interface ClinicSettings {
  name: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  slotDurationMinutes: number;
  openingTime: string;
  closingTime: string;
  workDays: string[];
  dentists: Dentist[];
  services: DentalService[];
  faqs: ClinicFaqItem[];
  adminNotificationPhone: string;
  metaVerified: boolean;
}

export interface NotificationItem {
  id: string;
  type:
    | 'new_booking'
    | 'reschedule_request'
    | 'cancellation'
    | 'new_message'
    | 'feedback_received'
    | 'reminder_dispatched';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
  patientName?: string;
}

export interface FeedbackItem {
  id: string;
  patientId: string;
  patientName: string;
  bookingId: string;
  service: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedVisit: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Clinic Manager' | 'Receptionist' | 'Lead Dentist';
  avatar: string;
}
