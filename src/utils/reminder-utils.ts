export interface ReminderCandidate {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  service: string;
  date: string;
  time: string;
  dentistName: string;
  status: string;
  reminder24hSent: boolean;
  reminder2hSent?: boolean;
}

export interface ReminderStats {
  totalNext48h: number;
  unsentCount: number;
  alreadySentCount: number;
  confirmedCount: number;
}

/**
 * Checks if an appointment date string (YYYY-MM-DD) falls within the 48-hour window
 * relative to the reference date string (default 2026-10-18).
 */
export function isWithinNext48Hours(
  appointmentDateStr: string,
  referenceDateStr: string = '2026-10-18'
): boolean {
  try {
    const refDate = new Date(`${referenceDateStr}T00:00:00`);
    const apptDate = new Date(`${appointmentDateStr}T00:00:00`);

    if (isNaN(refDate.getTime()) || isNaN(apptDate.getTime())) {
      // Fallback string matching for mock dates
      return (
        appointmentDateStr === referenceDateStr ||
        appointmentDateStr === '2026-10-19' ||
        appointmentDateStr === '2026-10-20'
      );
    }

    const diffMs = apptDate.getTime() - refDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Matches today (0h), tomorrow (24h), and up to 48 hours out (e.g. +48h)
    return diffHours >= 0 && diffHours <= 48;
  } catch {
    return false;
  }
}

/**
 * Filters confirmed bookings that qualify for bulk appointment reminders in the next 48 hours.
 */
export function getBookingsForNext48Hours(
  bookings: ReminderCandidate[],
  referenceDateStr: string = '2026-10-18',
  onlyUnsent: boolean = false
): ReminderCandidate[] {
  return bookings.filter((b) => {
    const isConfirmed = b.status === 'confirmed';
    if (!isConfirmed) return false;

    const inWindow = isWithinNext48Hours(b.date, referenceDateStr);
    if (!inWindow) return false;

    if (onlyUnsent && b.reminder24hSent) {
      return false;
    }

    return true;
  });
}

/**
 * Computes reminder statistics for the bulk reminder dashboard.
 */
export function calculateReminderStats(
  bookings: ReminderCandidate[],
  referenceDateStr: string = '2026-10-18'
): ReminderStats {
  const next48hConfirmed = bookings.filter(
    (b) => b.status === 'confirmed' && isWithinNext48Hours(b.date, referenceDateStr)
  );

  const unsentCount = next48hConfirmed.filter((b) => !b.reminder24hSent).length;
  const alreadySentCount = next48hConfirmed.filter((b) => b.reminder24hSent).length;

  return {
    totalNext48h: next48hConfirmed.length,
    unsentCount,
    alreadySentCount,
    confirmedCount: next48hConfirmed.length
  };
}

/**
 * Formats the reminder template with individual booking variables.
 */
export function formatReminderMessage(
  template: string,
  booking: {
    patientName: string;
    dentistName: string;
    date: string;
    time: string;
    service: string;
  },
  clinicName: string = 'SmileCraft Dental Studio'
): string {
  const slotStr = `${booking.date} at ${booking.time}`;
  return template
    .replace(/{patient_name}/g, booking.patientName)
    .replace(/{dentist_name}/g, booking.dentistName)
    .replace(/{slot}/g, slotStr)
    .replace(/{date}/g, booking.date)
    .replace(/{time}/g, booking.time)
    .replace(/{service}/g, booking.service)
    .replace(/{clinic_name}/g, clinicName);
}

export const DEFAULT_REMINDER_TEMPLATE =
  '⏰ *Appointment Reminder*\n\n' +
  'Hi *{patient_name}*, this is a friendly reminder for your dental appointment with *{dentist_name}*:\n\n' +
  '📅 *When:* {date} at {time}\n' +
  '🦷 *Treatment:* {service}\n' +
  '📍 *Location:* SmileCraft Dental, 450 Sutter St, Suite 1400\n\n' +
  'Please reply *1* to Confirm or *Reschedule* if you need a different slot.';
