export interface BotContext {
  step: string;
  patientName?: string;
  patientPhone?: string;
  reason?: string;
  preferredDate?: string;
  preferredTime?: string;
  details?: string;
  pendingBookingId?: string;
}

export interface BotReply {
  text: string;
  options?: string[];
  newStep: string;
  action?: 'create_booking' | 'request_reschedule' | 'cancel_booking' | 'save_feedback' | 'none';
  bookingData?: {
    patientName: string;
    patientPhone: string;
    reason: string;
    date: string;
    time: string;
    details: string;
  };
  feedbackData?: {
    rating: number;
    comment: string;
  };
}

export interface ClinicFaq {
  keywords: string[];
  answer: string;
}

export const DEFAULT_REASONS = [
  'Checkup',
  'Cleaning',
  'Tooth pain',
  'Filling',
  'Root canal',
  'Braces',
  'Whitening',
  'Extraction',
  'Other'
];

export const DEFAULT_FAQS: ClinicFaq[] = [
  {
    keywords: ['hour', 'time', 'open', 'close', 'when'],
    answer: '🕒 *Clinic Hours:*\nMon – Fri: 8:30 AM – 7:00 PM\nSaturday: 9:00 AM – 4:00 PM\nSunday: Closed (Emergency on-call only).'
  },
  {
    keywords: ['address', 'location', 'where', 'direction', 'map'],
    answer: '📍 *SmileCraft Dental Clinic:*\n450 Sutter St, Suite 1400, San Francisco, CA 94108.\nValidated parking available in the building garage.'
  },
  {
    keywords: ['insurance', 'coverage', 'pay', 'cost', 'fee', 'price'],
    answer: '💳 *Insurance & Payment:*\nWe accept Delta Dental, Cigna, MetLife, Aetna, and Guardian. Flexible 0% interest financing via CareCredit is also available!'
  },
  {
    keywords: ['emergency', 'urgent', 'severe', 'bleeding'],
    answer: '🚨 *Dental Emergency:*\nIf you are experiencing severe bleeding or trauma, call our 24/7 emergency hotline immediately at (415) 555-0199.'
  }
];

/**
 * Pure function: parses and processes a patient WhatsApp message given current state
 */
export function processBotMessage(
  inputRaw: string,
  context: BotContext,
  isPaused: boolean = false,
  customReasons: string[] = DEFAULT_REASONS,
  faqs: ClinicFaq[] = DEFAULT_FAQS
): BotReply {
  const input = inputRaw.trim();
  const lower = input.toLowerCase();

  // If staff has taken over / bot is paused, bot remains quiet
  if (isPaused) {
    return {
      text: '',
      newStep: context.step,
      action: 'none'
    };
  }

  // Global command: Help / FAQs check if not in the middle of active booking details
  if (lower === 'help' || lower === 'menu') {
    return {
      text: '👋 *SmileCraft Dental Virtual Assistant*\n\nHere are things you can do:\n• Reply *Hi* or *Book* to schedule an appointment\n• Reply *Reschedule* to change your booking\n• Reply *Cancel* to cancel a pending visit\n• Reply *Hours*, *Location*, or *Insurance* for clinic information\n• Type *Human* to speak with our reception staff.',
      options: ['Book Appointment', 'Clinic Hours', 'Location', 'Insurance Info'],
      newStep: context.step || 'IDLE',
      action: 'none'
    };
  }

  // Check FAQs first if input matches keywords and not answering structured steps
  if (['IDLE', 'COMPLETED', ''].includes(context.step)) {
    for (const faq of faqs) {
      if (faq.keywords.some((kw) => lower.includes(kw))) {
        return {
          text: faq.answer + '\n\nWould you like to book an appointment now? Reply *Yes* or *Book*.',
          options: ['Book Appointment', 'Clinic Hours', 'Location'],
          newStep: 'IDLE',
          action: 'none'
        };
      }
    }
  }

  // Global command: Reschedule
  if (lower === 'reschedule' || lower.includes('change appointment') || lower.includes('reschedule appointment')) {
    return {
      text: '🔄 *Reschedule Appointment*\n\nSure, we can help you pick a new date and time. Your current slot remains reserved until your new time is confirmed by our staff.\n\nPlease select your preferred new date and time slot:',
      options: ['Tomorrow 10:00 AM', 'Tomorrow 2:30 PM', 'Next Mon 11:00 AM', 'Next Tue 4:00 PM'],
      newStep: 'AWAITING_RESCHEDULE_DATETIME',
      action: 'none'
    };
  }

  // Global command: Cancel
  if (lower === 'cancel' || lower === 'cancel appointment') {
    return {
      text: '⚠️ *Cancel Appointment*\n\nAre you sure you want to cancel your upcoming appointment? Reply *Confirm Cancel* or *Keep Booking*.',
      options: ['Confirm Cancel', 'Keep Booking'],
      newStep: 'AWAITING_CANCEL_CONFIRM',
      action: 'none'
    };
  }

  // State: Awaiting cancel confirmation
  if (context.step === 'AWAITING_CANCEL_CONFIRM') {
    if (lower.includes('confirm') || lower === 'yes') {
      return {
        text: '✅ Your appointment has been cancelled. If you need any future care or advice, feel free to text us here anytime. Have a wonderful day! 🦷',
        newStep: 'IDLE',
        action: 'cancel_booking'
      };
    } else {
      return {
        text: '👍 Your appointment remains active and confirmed. We look forward to seeing you!',
        newStep: 'IDLE',
        action: 'none'
      };
    }
  }

  // State: Awaiting reschedule date/time
  if (context.step === 'AWAITING_RESCHEDULE_DATETIME') {
    return {
      text: `📅 *Reschedule Request Received!*\n\nYou requested: *${input}*.\n\nOur clinic coordinator has been notified and will verify the schedule and confirm your new slot shortly.`,
      newStep: 'IDLE',
      action: 'request_reschedule',
      bookingData: {
        patientName: context.patientName || 'Patient',
        patientPhone: context.patientPhone || '',
        reason: context.reason || 'General Visit',
        date: input.split(' ')[0] || 'Next Available',
        time: input.split(' ').slice(1).join(' ') || 'Morning',
        details: 'Reschedule request from patient'
      }
    };
  }

  // State: AWAITING_FEEDBACK (Rating 1-5 & optional comment)
  if (context.step === 'AWAITING_FEEDBACK') {
    const starMatch = input.match(/[1-5]/);
    const rating = starMatch ? parseInt(starMatch[0], 10) : 5;
    const comment = input.replace(/[1-5](\s*stars?)?/gi, '').trim() || 'Great service!';
    return {
      text: `🌟 *Thank You for Your Feedback!*\n\nYou gave us ${'⭐'.repeat(rating)} (${rating}/5).\nComment: "${comment}"\n\nYour review helps our dental care team continuously provide the best smile care. We appreciate you!`,
      newStep: 'IDLE',
      action: 'save_feedback',
      feedbackData: {
        rating,
        comment
      }
    };
  }

  // Step 1: Greeting / Start
  if (context.step === 'IDLE' || !context.step) {
    return {
      text: '👋 *Welcome to SmileCraft Dental Clinic!*\n\nI am your 24/7 WhatsApp dental booking assistant. I can help you schedule a visit in less than 2 minutes.\n\nTo get started, could you please tell me your **full name**?',
      newStep: 'AWAITING_NAME'
    };
  }

  // Step 2: Name received -> Ask phone
  if (context.step === 'AWAITING_NAME') {
    const name = input;
    return {
      text: `Nice to meet you, *${name}*! 🦷\n\nCould you please confirm your **phone number** so our clinic can send your SMS/WhatsApp reminders and reach you if needed?`,
      options: ['Use Current WhatsApp Number', 'Enter Another Number'],
      newStep: 'AWAITING_PHONE'
    };
  }

  // Step 3: Phone received -> Ask reason for visit
  if (context.step === 'AWAITING_PHONE') {
    const phone = input.includes('Current') ? (context.patientPhone || '+1 (555) 234-8901') : input;
    const reasonsList = customReasons.map((r, i) => `${i + 1}. ${r}`).join('\n');
    return {
      text: `Got it! 📱 Phone saved as: *${phone}*.\n\nWhat is the **primary reason for your visit** today? Please select from the menu below or type the number:\n\n${reasonsList}`,
      options: customReasons,
      newStep: 'AWAITING_REASON'
    };
  }

  // Step 4: Reason received -> Ask preferred date & time slot
  if (context.step === 'AWAITING_REASON') {
    let selectedReason = input;
    const num = parseInt(input, 10);
    if (!isNaN(num) && num >= 1 && num <= customReasons.length) {
      selectedReason = customReasons[num - 1];
    }

    return {
      text: `Got it: *${selectedReason}*.\n\nWhen would you like to come in? Here are our next available slots based on clinic hours:\n\n1. *Tomorrow, 10:00 AM*\n2. *Tomorrow, 2:30 PM*\n3. *Thursday, 11:15 AM*\n4. *Friday, 4:00 PM*\n\nTap an option or type your preferred date & time:`,
      options: ['Tomorrow 10:00 AM', 'Tomorrow 2:30 PM', 'Thursday 11:15 AM', 'Friday 4:00 PM'],
      newStep: 'AWAITING_DATETIME'
    };
  }

  // Step 5: Date/Time slot received -> Ask for specific details / notes
  if (context.step === 'AWAITING_DATETIME') {
    return {
      text: `Preferred slot noted: *${input}*.\n\nDo you have **any specific details or symptoms** you'd like our dental team to know before your visit? (e.g., sensitivity to cold, specific tooth location, first-time dental anxiety, etc.)\n\n_If none, simply reply "None" or "No"._`,
      options: ['None, routine visit', 'Upper molar sensitivity', 'Severe pain when chewing', 'First time visit'],
      newStep: 'AWAITING_DETAILS'
    };
  }

  // Step 6: Specific details received -> Create booking & confirm Pending
  if (context.step === 'AWAITING_DETAILS') {
    const details = input.toLowerCase() === 'none' || input.toLowerCase() === 'no' ? 'None specified' : input;
    const bookingSummary = `📋 *Booking Request Summary:*\n` +
      `• *Patient:* ${context.patientName || 'Patient'}\n` +
      `• *Phone:* ${context.patientPhone || 'On File'}\n` +
      `• *Reason:* ${context.reason || 'Checkup'}\n` +
      `• *Requested Slot:* ${context.preferredDate || 'Tomorrow'} ${context.preferredTime || '10:00 AM'}\n` +
      `• *Notes:* ${details}\n\n` +
      `⏳ *Request sent, clinic will confirm shortly.*\n` +
      `Your booking status is currently **Pending**. Our receptionist will review the schedule and send you a confirmation message right here on WhatsApp!`;

    return {
      text: bookingSummary,
      newStep: 'COMPLETED',
      action: 'create_booking',
      bookingData: {
        patientName: context.patientName || 'Patient',
        patientPhone: context.patientPhone || '+1 (555) 234-8901',
        reason: context.reason || 'General Checkup',
        date: context.preferredDate || 'Tomorrow',
        time: context.preferredTime || '10:00 AM',
        details
      }
    };
  }

  // Default fallback
  return {
    text: 'I didn\'t quite catch that. Type *Hi* to start a new booking or *Help* to see clinic services and hours.',
    options: ['Book Appointment', 'Clinic Hours', 'Location'],
    newStep: 'IDLE'
  };
}
