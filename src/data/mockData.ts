import {
  ClinicSettings,
  FlowStep,
  Patient,
  Booking,
  Conversation,
  ChatMessage,
  FeedbackItem,
  NotificationItem,
  StaffUser
} from '../types';

export const INITIAL_STAFF: StaffUser = {
  id: 'staff-1',
  name: 'Jessica Vance',
  email: 'jessica@smilecraftdental.com',
  role: 'Clinic Manager',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_CLINIC_SETTINGS: ClinicSettings = {
  name: 'SmileCraft Dental Studio',
  phone: '+1 (415) 555-0144',
  whatsappNumber: '+1 (415) 555-0188',
  email: 'care@smilecraftdental.com',
  address: '450 Sutter St, Suite 1400, San Francisco, CA 94108',
  slotDurationMinutes: 45,
  openingTime: '08:30',
  closingTime: '18:30',
  workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  adminNotificationPhone: '+1 (415) 555-0199',
  metaVerified: true,
  dentists: [
    {
      id: 'dentist-1',
      name: 'Dr. Sarah Jenkins, DDS',
      role: 'Principal Dentist',
      specialty: 'Cosmetic & Restorative Dentistry',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      room: 'Operatory 1'
    },
    {
      id: 'dentist-2',
      name: 'Dr. Michael Chen, DMD',
      role: 'Orthodontic Specialist',
      specialty: 'Invisalign & Clear Aligners',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
      room: 'Operatory 2'
    },
    {
      id: 'dentist-3',
      name: 'Dr. Emily Rivera, DDS',
      role: 'Endodontist & Oral Surgeon',
      specialty: 'Root Canal & Emergency Pain Relief',
      avatar: 'https://images.unsplash.com/photo-1594824813583-b7c4d51674a2?w=150&auto=format&fit=crop&q=80',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      room: 'Operatory 3'
    }
  ],
  services: [
    {
      id: 'srv-1',
      name: 'Comprehensive Checkup & X-Rays',
      category: 'Preventative',
      durationMinutes: 45,
      price: 65,
      description: 'Full digital mouth scans, periodontal evaluation, and cancer screening.'
    },
    {
      id: 'srv-2',
      name: 'Deep Ultrasonic Cleaning',
      category: 'Preventative',
      durationMinutes: 45,
      price: 110,
      description: 'Plaque and tartar removal with gentle polishing and fluoride finish.'
    },
    {
      id: 'srv-3',
      name: 'Emergency Tooth Pain Assessment',
      category: 'Restorative',
      durationMinutes: 30,
      price: 85,
      description: 'Rapid diagnostic imaging, sensitivity testing, and emergency relief.'
    },
    {
      id: 'srv-4',
      name: 'Composite Dental Filling',
      category: 'Restorative',
      durationMinutes: 45,
      price: 180,
      description: 'Natural tooth-colored bonding to seal and restore decayed tooth structure.'
    },
    {
      id: 'srv-5',
      name: 'Microscopic Root Canal Therapy',
      category: 'Restorative',
      durationMinutes: 75,
      price: 750,
      description: 'Gentle, pain-free endodontic procedure using 3D microscope tech.'
    },
    {
      id: 'srv-6',
      name: 'Laser Teeth Whitening (In-Office)',
      category: 'Cosmetic',
      durationMinutes: 60,
      price: 320,
      description: 'Up to 8 shades brighter in a single 1-hour session.'
    },
    {
      id: 'srv-7',
      name: 'Invisalign / Clear Braces Consultation',
      category: 'Orthodontics',
      durationMinutes: 45,
      price: 0,
      description: 'Complimentary 3D iTero scan with simulated smile outcome preview.'
    },
    {
      id: 'srv-8',
      name: 'Gentle Tooth Extraction',
      category: 'Surgical',
      durationMinutes: 45,
      price: 240,
      description: 'Comfortable extraction with local anesthetic and healing plasma.'
    }
  ],
  faqs: [
    {
      id: 'faq-1',
      keywords: ['hour', 'time', 'open', 'close', 'when', 'saturday'],
      question: 'What are clinic operating hours?',
      answer: '🕒 *Clinic Hours:*\nMon – Fri: 8:30 AM – 6:30 PM\nSaturday: 9:00 AM – 3:30 PM\nSunday: Closed (Emergency triage available via WhatsApp).'
    },
    {
      id: 'faq-2',
      keywords: ['address', 'location', 'where', 'direction', 'parking', 'map'],
      question: 'Where are you located and is there parking?',
      answer: '📍 *Location:*\n450 Sutter St, Suite 1400 (between Stockton & Powell), San Francisco, CA.\n🚗 *Parking:* Validated valet parking available in the Sutter-Stockton garage across the street!'
    },
    {
      id: 'faq-3',
      keywords: ['insurance', 'coverage', 'delta', 'cigna', 'metlife', 'pay', 'cost'],
      question: 'Do you accept dental insurance?',
      answer: '💳 *Insurance:* We are in-network with Delta Dental Premier, Cigna, MetLife, Aetna, Guardian, and Humana. We also provide zero-interest monthly plans via CareCredit.'
    },
    {
      id: 'faq-4',
      keywords: ['emergency', 'urgent', 'severe', 'bleeding', 'swollen'],
      question: 'How do you handle dental emergencies?',
      answer: '🚨 *Dental Emergencies:*\nSame-day emergency slots are reserved daily. If in acute pain, reply "Tooth pain" or call our urgent line directly at (415) 555-0199.'
    }
  ]
};

export const INITIAL_FLOW_STEPS: FlowStep[] = [
  {
    id: 'step-1',
    key: 'greeting',
    title: '1. Greeting & Name Request',
    description: 'Triggered when patient sends "Hi", "Hello", or first message.',
    enabled: true,
    messageTemplate: '👋 *Welcome to SmileCraft Dental Clinic!*\n\nI am your 24/7 WhatsApp booking assistant. To get started, could you please tell me your **full name**?',
    order: 1
  },
  {
    id: 'step-2',
    key: 'phone',
    title: '2. Phone Number Confirmation',
    description: 'Confirms WhatsApp phone number or allows input of another phone.',
    enabled: true,
    messageTemplate: 'Nice to meet you, *{patient_name}*! 🦷\n\nCould you please confirm your phone number so our team can send appointment reminders?',
    options: ['Use Current WhatsApp Number', 'Enter Another Number'],
    order: 2
  },
  {
    id: 'step-3',
    key: 'reason_menu',
    title: '3. Reason-for-Visit Menu',
    description: 'Interactive list of visit reasons.',
    enabled: true,
    messageTemplate: 'Got it! 📱 Phone saved.\n\nWhat is the primary reason for your visit today? Please choose from the options below:',
    options: ['Checkup', 'Cleaning', 'Tooth pain', 'Filling', 'Root canal', 'Braces', 'Whitening', 'Extraction', 'Other'],
    order: 3
  },
  {
    id: 'step-4',
    key: 'datetime_slot',
    title: '4. Date & Time Slot Selection',
    description: 'Offers available schedule slots matching clinic hours.',
    enabled: true,
    messageTemplate: 'Got it: *{reason}*.\n\nWhen would you like to come in? Here are next available slots:\n\n1. *Tomorrow, 10:00 AM*\n2. *Tomorrow, 2:30 PM*\n3. *Thursday, 11:15 AM*\n4. *Friday, 4:00 PM*\n\nTap an option or type your preferred slot:',
    options: ['Tomorrow 10:00 AM', 'Tomorrow 2:30 PM', 'Thursday 11:15 AM', 'Friday 4:00 PM'],
    order: 4
  },
  {
    id: 'step-5',
    key: 'details_prompt',
    title: '5. Specific Details / Symptoms',
    description: 'Asks patient for specific symptoms or notes.',
    enabled: true,
    messageTemplate: 'Preferred slot noted: *{slot}*.\n\nDo you have any specific symptoms or notes our dentist should know beforehand? (If none, type "None").',
    options: ['None, routine visit', 'Upper molar sensitivity', 'Severe pain chewing', 'First time visit'],
    order: 5
  },
  {
    id: 'step-6',
    key: 'pending_confirmation',
    title: '6. Pending Request Sent',
    description: 'Informs patient request is saved as Pending awaiting clinic review.',
    enabled: true,
    messageTemplate: '⏳ *Request sent, clinic will confirm shortly.*\n\nYour appointment request for *{reason}* on *{slot}* is marked as **Pending**. Our receptionist will verify the doctor\'s calendar and confirm right here on WhatsApp!',
    order: 6
  },
  {
    id: 'step-7',
    key: 'admin_approved',
    title: '7. Admin Approval Notification',
    description: 'Sent automatically when admin approves booking in the CRM.',
    enabled: true,
    messageTemplate: '✅ *Appointment Confirmed!*\n\nGreat news *{patient_name}*! Your visit with *{dentist_name}* is officially confirmed:\n📅 *Date & Time:* {slot}\n📍 *Location:* SmileCraft Dental, Suite 1400\n\nPlease arrive 10 minutes early. Type *Reschedule* or *Cancel* anytime if your plans change.',
    order: 7
  },
  {
    id: 'step-8',
    key: 'reminders',
    title: '8. Automatic Reminders (24h & 2h)',
    description: 'Automated notification sent 24h and 2h before the visit.',
    enabled: true,
    messageTemplate: '⏰ *Appointment Reminder:*\nHi {patient_name}, you have a dental appointment tomorrow at *{time}* with {dentist_name}. Reply *1* to Confirm or *Reschedule* if needed.',
    order: 8
  },
  {
    id: 'step-9',
    key: 'reschedule_flow',
    title: '9. Reschedule Flow',
    description: 'Triggered when patient texts "reschedule". Old slot stays until new is approved.',
    enabled: true,
    messageTemplate: '🔄 *Reschedule Request:*\nSure! Please select your new preferred slot. Your previous slot remains reserved until your new time is approved by our team.',
    options: ['Tomorrow 10:00 AM', 'Tomorrow 2:30 PM', 'Next Mon 11:00 AM', 'Next Tue 4:00 PM'],
    order: 9
  },
  {
    id: 'step-10',
    key: 'cancel_flow',
    title: '10. Cancellation Flow',
    description: 'Triggered when patient texts "cancel".',
    enabled: true,
    messageTemplate: '⚠️ Are you sure you want to cancel your appointment? Reply *Confirm Cancel* to proceed, or *Keep Booking*.',
    options: ['Confirm Cancel', 'Keep Booking'],
    order: 10
  },
  {
    id: 'step-11',
    key: 'feedback_flow',
    title: '11. Post-Visit Feedback (1-5 Rating)',
    description: 'Triggered after appointment or when admin marks booking Completed.',
    enabled: true,
    messageTemplate: '🌟 *How was your visit with us today?*\n\nReply with a rating from **1 to 5 stars** (e.g. "5 stars - painless clean!") and any quick comments. We love hearing from you! 🦷',
    options: ['⭐⭐⭐⭐⭐ Excellent', '⭐⭐⭐⭐ Good', '⭐⭐⭐ Okay', '⭐⭐ Fair'],
    order: 11
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Marcus Sterling',
    phone: '+1 (415) 612-4491',
    email: 'marcus.sterling@gmail.com',
    notes: 'Mild dental anxiety. Prefers Dr. Sarah Jenkins. Delta Dental insurance.',
    tags: ['Tooth Pain', 'VIP Patient', 'Delta Dental'],
    createdAt: '2026-09-10',
    lastContactAt: '10 mins ago',
    isBotPaused: false,
    totalVisits: 3,
    lifetimeSpend: 890,
    insuranceProvider: 'Delta Dental Premier',
    status: 'active'
  },
  {
    id: 'pat-2',
    name: 'Elena Rostova',
    phone: '+1 (415) 782-9014',
    email: 'elena.rostova@techcorp.io',
    notes: 'Interested in Invisalign consultation for lower crowding. Very prompt.',
    tags: ['Invisalign', 'New Patient', 'Consultation'],
    createdAt: '2026-10-02',
    lastContactAt: '25 mins ago',
    isBotPaused: false,
    totalVisits: 1,
    lifetimeSpend: 0,
    insuranceProvider: 'Cigna Dental',
    status: 'active'
  },
  {
    id: 'pat-3',
    name: 'David K. Liu',
    phone: '+1 (415) 321-7782',
    email: 'davidliu92@outlook.com',
    notes: 'Completed root canal follow-up last week. Needs crown fitting scheduled.',
    tags: ['Root Canal', 'Follow-up Needed'],
    createdAt: '2026-08-14',
    lastContactAt: '1 hour ago',
    isBotPaused: true, // staff took over chat
    totalVisits: 4,
    lifetimeSpend: 1450,
    insuranceProvider: 'MetLife',
    status: 'follow_up'
  },
  {
    id: 'pat-4',
    name: 'Chloe Davenport',
    phone: '+1 (415) 443-8821',
    email: 'chloe.dav@gmail.com',
    notes: 'Whitening patient. Requested rescheduling to accommodate business trip.',
    tags: ['Whitening', 'Reschedule Pending'],
    createdAt: '2026-10-12',
    lastContactAt: '2 hours ago',
    isBotPaused: false,
    totalVisits: 2,
    lifetimeSpend: 430,
    insuranceProvider: 'Aetna',
    status: 'active'
  },
  {
    id: 'pat-5',
    name: 'Robert Miller',
    phone: '+1 (415) 902-1134',
    email: 'rmiller@bayworks.com',
    notes: 'Regular checkup & cleaning every 6 months. High dental hygiene compliance.',
    tags: ['Routine Care', 'Loyal Patient'],
    createdAt: '2025-11-20',
    lastContactAt: 'Yesterday',
    isBotPaused: false,
    totalVisits: 6,
    lifetimeSpend: 1120,
    insuranceProvider: 'Guardian',
    status: 'active'
  },
  {
    id: 'pat-6',
    name: 'Maya Patel',
    phone: '+1 (415) 555-0177',
    email: 'maya.patel@healthdesign.co',
    notes: 'Root canal checkup and crown polish. Prompt responder on WhatsApp.',
    tags: ['Root Canal', 'Upcoming Visit'],
    createdAt: '2026-09-22',
    lastContactAt: '3 hours ago',
    isBotPaused: false,
    totalVisits: 2,
    lifetimeSpend: 620,
    insuranceProvider: 'Delta Dental Premier',
    status: 'active'
  },
  {
    id: 'pat-7',
    name: 'Lucas Vance',
    phone: '+1 (415) 555-0188',
    email: 'lucas.vance@soundwave.io',
    notes: 'Laser whitening visit. Wants morning slot, sensitive to peroxide.',
    tags: ['Whitening', 'Cosmetic'],
    createdAt: '2026-10-05',
    lastContactAt: '5 hours ago',
    isBotPaused: false,
    totalVisits: 1,
    lifetimeSpend: 0,
    insuranceProvider: 'Aetna',
    status: 'active'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    patientId: 'pat-1',
    patientName: 'Marcus Sterling',
    patientPhone: '+1 (415) 612-4491',
    service: 'Tooth pain assessment',
    date: '2026-10-18',
    time: '10:00 AM',
    dentistId: 'dentist-3',
    dentistName: 'Dr. Emily Rivera, DDS',
    status: 'pending',
    notes: 'Severe sharp pain on upper left molar while chewing cold food.',
    reminder24hSent: false,
    reminder2hSent: false,
    createdAt: '2026-10-17 21:50',
    fee: 85
  },
  {
    id: 'bk-102',
    patientId: 'pat-4',
    patientName: 'Chloe Davenport',
    patientPhone: '+1 (415) 443-8821',
    service: 'Laser Teeth Whitening',
    date: '2026-10-20',
    time: '02:30 PM',
    dentistId: 'dentist-1',
    dentistName: 'Dr. Sarah Jenkins, DDS',
    status: 'rescheduled_pending',
    notes: 'Patient typed "reschedule" on WhatsApp. Requested shift from Oct 18 to Oct 20.',
    previousSlot: {
      date: '2026-10-18',
      time: '11:00 AM'
    },
    reminder24hSent: false,
    reminder2hSent: false,
    createdAt: '2026-10-17 19:30',
    fee: 320
  },
  {
    id: 'bk-103',
    patientId: 'pat-2',
    patientName: 'Elena Rostova',
    patientPhone: '+1 (415) 782-9014',
    service: 'Invisalign Consultation',
    date: '2026-10-18',
    time: '04:00 PM',
    dentistId: 'dentist-2',
    dentistName: 'Dr. Michael Chen, DMD',
    status: 'confirmed',
    notes: 'First time consultation. Interested in 6-month clear aligners.',
    reminder24hSent: true,
    reminder2hSent: false,
    createdAt: '2026-10-17 14:10',
    fee: 0
  },
  {
    id: 'bk-104',
    patientId: 'pat-5',
    patientName: 'Robert Miller',
    patientPhone: '+1 (415) 902-1134',
    service: 'Comprehensive Checkup & Cleaning',
    date: '2026-10-17',
    time: '09:30 AM',
    dentistId: 'dentist-1',
    dentistName: 'Dr. Sarah Jenkins, DDS',
    status: 'completed',
    notes: 'Routine visit completed without complications. Calculus removed, polish applied.',
    reminder24hSent: true,
    reminder2hSent: true,
    createdAt: '2026-10-15 11:00',
    fee: 175,
    feedbackRating: 5,
    feedbackComment: 'Dr. Jenkins was remarkably gentle and explained every step with the intraoral camera!'
  },
  {
    id: 'bk-105',
    patientId: 'pat-3',
    patientName: 'David K. Liu',
    patientPhone: '+1 (415) 321-7782',
    service: 'Composite Dental Filling',
    date: '2026-10-19',
    time: '11:30 AM',
    dentistId: 'dentist-1',
    dentistName: 'Dr. Sarah Jenkins, DDS',
    status: 'confirmed',
    notes: 'Filling on lower right premolar.',
    reminder24hSent: false,
    reminder2hSent: false,
    createdAt: '2026-10-16 16:20',
    fee: 180
  },
  {
    id: 'bk-106',
    patientId: 'pat-6',
    patientName: 'Maya Patel',
    patientPhone: '+1 (415) 555-0177',
    service: 'Root Canal Follow-up',
    date: '2026-10-19',
    time: '02:00 PM',
    dentistId: 'dentist-2',
    dentistName: 'Dr. Michael Chen, DMD',
    status: 'confirmed',
    notes: 'Microscopic inspection and final seal.',
    reminder24hSent: false,
    reminder2hSent: false,
    createdAt: '2026-10-17 11:30',
    fee: 150
  },
  {
    id: 'bk-107',
    patientId: 'pat-7',
    patientName: 'Lucas Vance',
    patientPhone: '+1 (415) 555-0188',
    service: 'Laser Teeth Whitening',
    date: '2026-10-20',
    time: '10:30 AM',
    dentistId: 'dentist-3',
    dentistName: 'Dr. Emily Rivera, DDS',
    status: 'confirmed',
    notes: 'Pre-wedding whitening session. Shade check requested.',
    reminder24hSent: false,
    reminder2hSent: false,
    createdAt: '2026-10-17 15:00',
    fee: 320
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    patientId: 'pat-1',
    patientName: 'Marcus Sterling',
    patientPhone: '+1 (415) 612-4491',
    patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Request sent, clinic will confirm shortly.',
    lastMessageTime: '21:52',
    unreadCount: 1,
    status: 'needs_attention',
    isBotPaused: false,
    botStep: 'COMPLETED',
    botContext: {
      step: 'COMPLETED',
      patientName: 'Marcus Sterling',
      patientPhone: '+1 (415) 612-4491',
      reason: 'Tooth pain',
      preferredDate: 'Tomorrow',
      preferredTime: '10:00 AM',
      details: 'Severe sharp pain on upper left molar while chewing cold food.'
    }
  },
  {
    id: 'conv-2',
    patientId: 'pat-4',
    patientName: 'Chloe Davenport',
    patientPhone: '+1 (415) 443-8821',
    patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Reschedule request received for Oct 20, 2:30 PM.',
    lastMessageTime: '19:35',
    unreadCount: 1,
    status: 'needs_attention',
    isBotPaused: false,
    botStep: 'IDLE',
    botContext: {
      step: 'IDLE',
      patientName: 'Chloe Davenport',
      patientPhone: '+1 (415) 443-8821',
      reason: 'Whitening'
    }
  },
  {
    id: 'conv-3',
    patientId: 'pat-2',
    patientName: 'Elena Rostova',
    patientPhone: '+1 (415) 782-9014',
    patientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Appointment Confirmed! Dr. Michael Chen is ready.',
    lastMessageTime: '14:15',
    unreadCount: 0,
    status: 'open',
    isBotPaused: false,
    botStep: 'COMPLETED',
    botContext: {
      step: 'COMPLETED',
      patientName: 'Elena Rostova',
      patientPhone: '+1 (415) 782-9014',
      reason: 'Braces'
    }
  },
  {
    id: 'conv-4',
    patientId: 'pat-3',
    patientName: 'David K. Liu',
    patientPhone: '+1 (415) 321-7782',
    patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    lastMessage: '[Staff Taken Over] Hi David, Jessica here. I checked your chart and Dr. Jenkins is on schedule.',
    lastMessageTime: '11:45',
    unreadCount: 0,
    status: 'open',
    isBotPaused: true, // paused by Jessica
    botStep: 'IDLE',
    botContext: {
      step: 'IDLE',
      patientName: 'David K. Liu'
    }
  },
  {
    id: 'conv-5',
    patientId: 'pat-5',
    patientName: 'Robert Miller',
    patientPhone: '+1 (415) 902-1134',
    patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    lastMessage: '🌟 5 stars Dr. Jenkins was remarkably gentle!',
    lastMessageTime: '12:30',
    unreadCount: 0,
    status: 'resolved',
    isBotPaused: false,
    botStep: 'IDLE',
    botContext: {
      step: 'IDLE',
      patientName: 'Robert Miller'
    }
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm1',
      conversationId: 'conv-1',
      sender: 'patient',
      text: 'Hi, I need to book a dentist appointment',
      timestamp: '21:48',
      status: 'read'
    },
    {
      id: 'm2',
      conversationId: 'conv-1',
      sender: 'bot',
      text: '👋 *Welcome to SmileCraft Dental Clinic!*\n\nI am your 24/7 WhatsApp dental booking assistant. I can help you schedule a visit in less than 2 minutes.\n\nTo get started, could you please tell me your **full name**?',
      timestamp: '21:48',
      status: 'read'
    },
    {
      id: 'm3',
      conversationId: 'conv-1',
      sender: 'patient',
      text: 'Marcus Sterling',
      timestamp: '21:49',
      status: 'read'
    },
    {
      id: 'm4',
      conversationId: 'conv-1',
      sender: 'bot',
      text: 'Nice to meet you, *Marcus Sterling*! 🦷\n\nCould you please confirm your **phone number** so our clinic can send your SMS/WhatsApp reminders and reach you if needed?',
      timestamp: '21:49',
      status: 'read',
      options: ['Use Current WhatsApp Number', 'Enter Another Number']
    },
    {
      id: 'm5',
      conversationId: 'conv-1',
      sender: 'patient',
      text: 'Use Current WhatsApp Number',
      timestamp: '21:49',
      status: 'read'
    },
    {
      id: 'm6',
      conversationId: 'conv-1',
      sender: 'bot',
      text: 'Got it! 📱 Phone saved as: *+1 (415) 612-4491*.\n\nWhat is the **primary reason for your visit** today? Please select from the menu below:\n\n1. Checkup\n2. Cleaning\n3. Tooth pain\n4. Filling\n5. Root canal\n6. Braces\n7. Whitening\n8. Extraction\n9. Other',
      timestamp: '21:50',
      status: 'read',
      options: ['Checkup', 'Cleaning', 'Tooth pain', 'Filling', 'Root canal', 'Braces', 'Whitening', 'Extraction', 'Other']
    },
    {
      id: 'm7',
      conversationId: 'conv-1',
      sender: 'patient',
      text: 'Tooth pain',
      timestamp: '21:50',
      status: 'read'
    },
    {
      id: 'm8',
      conversationId: 'conv-1',
      sender: 'bot',
      text: 'Got it: *Tooth pain*.\n\nWhen would you like to come in? Here are our next available slots based on clinic hours:\n\n1. *Tomorrow, 10:00 AM*\n2. *Tomorrow, 2:30 PM*\n3. *Thursday, 11:15 AM*\n4. *Friday, 4:00 PM*\n\nTap an option or type your preferred date & time:',
      timestamp: '21:51',
      status: 'read',
      options: ['Tomorrow 10:00 AM', 'Tomorrow 2:30 PM', 'Thursday 11:15 AM', 'Friday 4:00 PM']
    },
    {
      id: 'm9',
      conversationId: 'conv-1',
      sender: 'patient',
      text: 'Tomorrow 10:00 AM',
      timestamp: '21:51',
      status: 'read'
    },
    {
      id: 'm10',
      conversationId: 'conv-1',
      sender: 'bot',
      text: 'Preferred slot noted: *Tomorrow 10:00 AM*.\n\nDo you have **any specific details or symptoms** you\'d like our dental team to know before your visit? (e.g., sensitivity to cold, specific tooth location, first-time dental anxiety, etc.)\n\n_If none, simply reply "None" or "No"._',
      timestamp: '21:51',
      status: 'read',
      options: ['None, routine visit', 'Upper molar sensitivity', 'Severe pain when chewing', 'First time visit']
    },
    {
      id: 'm11',
      conversationId: 'conv-1',
      sender: 'patient',
      text: 'Severe sharp pain on upper left molar while chewing cold food.',
      timestamp: '21:52',
      status: 'read'
    },
    {
      id: 'm12',
      conversationId: 'conv-1',
      sender: 'bot',
      text: '📋 *Booking Request Summary:*\n• *Patient:* Marcus Sterling\n• *Phone:* +1 (415) 612-4491\n• *Reason:* Tooth pain\n• *Requested Slot:* Tomorrow 10:00 AM\n• *Notes:* Severe sharp pain on upper left molar while chewing cold food.\n\n⏳ *Request sent, clinic will confirm shortly.*\nYour booking status is currently **Pending**. Our receptionist will review the schedule and send you a confirmation message right here on WhatsApp!',
      timestamp: '21:52',
      status: 'read'
    }
  ],
  'conv-2': [
    {
      id: 'm21',
      conversationId: 'conv-2',
      sender: 'patient',
      text: 'reschedule',
      timestamp: '19:33',
      status: 'read'
    },
    {
      id: 'm22',
      conversationId: 'conv-2',
      sender: 'bot',
      text: '🔄 *Reschedule Appointment*\n\nSure, we can help you pick a new date and time. Your current slot remains reserved until your new time is confirmed by our staff.\n\nPlease select your preferred new date and time slot:',
      timestamp: '19:33',
      status: 'read',
      options: ['Tomorrow 10:00 AM', 'Tomorrow 2:30 PM', 'Next Mon 11:00 AM', 'Oct 20, 2:30 PM']
    },
    {
      id: 'm23',
      conversationId: 'conv-2',
      sender: 'patient',
      text: 'Oct 20, 2:30 PM',
      timestamp: '19:34',
      status: 'read'
    },
    {
      id: 'm24',
      conversationId: 'conv-2',
      sender: 'bot',
      text: '📅 *Reschedule Request Received!*\n\nYou requested: *Oct 20, 2:30 PM*.\n\nOur clinic coordinator has been notified and will verify the schedule and confirm your new slot shortly.',
      timestamp: '19:35',
      status: 'read'
    }
  ],
  'conv-3': [
    {
      id: 'm31',
      conversationId: 'conv-3',
      sender: 'patient',
      text: 'Hi! Looking to book an Invisalign consultation.',
      timestamp: '14:05',
      status: 'read'
    },
    {
      id: 'm32',
      conversationId: 'conv-3',
      sender: 'bot',
      text: '👋 *Welcome to SmileCraft Dental Clinic!*\n\nI am your 24/7 WhatsApp dental booking assistant. Could you please tell me your **full name**?',
      timestamp: '14:06',
      status: 'read'
    },
    {
      id: 'm33',
      conversationId: 'conv-3',
      sender: 'patient',
      text: 'Elena Rostova',
      timestamp: '14:07',
      status: 'read'
    },
    {
      id: 'm34',
      conversationId: 'conv-3',
      sender: 'agent',
      senderName: 'Jessica Vance (Clinic Manager)',
      text: '✅ *Appointment Confirmed!*\n\nGreat news Elena! Your Invisalign consultation with *Dr. Michael Chen, DMD* is officially confirmed:\n📅 *Date & Time:* Tomorrow, 4:00 PM\n📍 *Location:* Suite 1400, 450 Sutter St\n\nWe look forward to seeing your smile!',
      timestamp: '14:15',
      status: 'delivered'
    }
  ],
  'conv-4': [
    {
      id: 'm41',
      conversationId: 'conv-4',
      sender: 'patient',
      text: 'Hello, is my filling still scheduled for tomorrow?',
      timestamp: '11:40',
      status: 'read'
    },
    {
      id: 'm42',
      conversationId: 'conv-4',
      sender: 'agent',
      senderName: 'Jessica Vance (Clinic Staff)',
      text: 'Hi David, Jessica here! Yes, Dr. Jenkins has you down for 11:30 AM tomorrow. We have your shade matched and ready. See you then!',
      timestamp: '11:45',
      status: 'read'
    }
  ],
  'conv-5': [
    {
      id: 'm51',
      conversationId: 'conv-5',
      sender: 'bot',
      text: '🌟 *How was your visit with us today?*\n\nReply with a rating from **1 to 5 stars** and any quick comments. We love hearing from you! 🦷',
      timestamp: '12:20',
      status: 'read',
      options: ['⭐⭐⭐⭐⭐ 5 Stars', '⭐⭐⭐⭐ 4 Stars', '⭐⭐⭐ 3 Stars']
    },
    {
      id: 'm52',
      conversationId: 'conv-5',
      sender: 'patient',
      text: '5 stars Dr. Jenkins was remarkably gentle!',
      timestamp: '12:30',
      status: 'read'
    },
    {
      id: 'm53',
      conversationId: 'conv-5',
      sender: 'bot',
      text: '🌟 *Thank You for Your Feedback!*\n\nYou gave us ⭐⭐⭐⭐⭐ (5/5).\nComment: "Dr. Jenkins was remarkably gentle!"\n\nYour review helps our dental care team continuously provide the best smile care. We appreciate you!',
      timestamp: '12:30',
      status: 'read'
    }
  ]
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'new_booking',
    title: 'New Booking Request',
    message: 'Marcus Sterling requested Tooth pain assessment for Tomorrow 10:00 AM.',
    timestamp: '10 mins ago',
    read: false,
    linkTab: 'bookings',
    patientName: 'Marcus Sterling'
  },
  {
    id: 'notif-2',
    type: 'reschedule_request',
    title: 'Reschedule Request',
    message: 'Chloe Davenport requested rescheduling to Oct 20, 2:30 PM.',
    timestamp: '2 hours ago',
    read: false,
    linkTab: 'bookings',
    patientName: 'Chloe Davenport'
  },
  {
    id: 'notif-3',
    type: 'feedback_received',
    title: 'New 5-Star Feedback',
    message: 'Robert Miller rated 5/5: "Dr. Jenkins was remarkably gentle!"',
    timestamp: '4 hours ago',
    read: true,
    linkTab: 'feedback',
    patientName: 'Robert Miller'
  }
];

export const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    patientId: 'pat-5',
    patientName: 'Robert Miller',
    bookingId: 'bk-104',
    service: 'Comprehensive Checkup & Cleaning',
    rating: 5,
    comment: 'Dr. Jenkins was remarkably gentle and explained every step with the intraoral camera! The WhatsApp reminder also saved my morning.',
    date: '2026-10-17',
    verifiedVisit: true
  },
  {
    id: 'fb-2',
    patientId: 'pat-1',
    patientName: 'Marcus Sterling',
    bookingId: 'bk-prior-1',
    service: 'Emergency Pain Relief',
    rating: 5,
    comment: 'Booked in under 2 minutes through WhatsApp on a Sunday evening. Lifesaver!',
    date: '2026-09-12',
    verifiedVisit: true
  },
  {
    id: 'fb-3',
    patientId: 'pat-3',
    patientName: 'David K. Liu',
    bookingId: 'bk-prior-2',
    service: 'Microscopic Root Canal Therapy',
    rating: 5,
    comment: 'Zero pain during the root canal with Dr. Rivera. The staff was super attentive and checked in on WhatsApp the next day.',
    date: '2026-08-15',
    verifiedVisit: true
  },
  {
    id: 'fb-4',
    patientId: 'pat-4',
    patientName: 'Chloe Davenport',
    bookingId: 'bk-prior-3',
    service: 'Laser Teeth Whitening',
    rating: 4,
    comment: 'Great whitening results, 6 shades lighter! Slight sensitivity for 24 hours but Dr. Sarah provided desensitizing gel.',
    date: '2026-07-22',
    verifiedVisit: true
  }
];
