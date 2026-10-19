import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isWithinNext48Hours,
  getBookingsForNext48Hours,
  calculateReminderStats,
  formatReminderMessage,
  type ReminderCandidate
} from './reminder-utils.ts';

const mockBookings: ReminderCandidate[] = [
  {
    id: 'b-1',
    patientId: 'p-1',
    patientName: 'Elena Rostova',
    patientPhone: '+14157829014',
    service: 'Invisalign Consultation',
    date: '2026-10-18',
    time: '04:00 PM',
    dentistName: 'Dr. Michael Chen',
    status: 'confirmed',
    reminder24hSent: true
  },
  {
    id: 'b-2',
    patientId: 'p-2',
    patientName: 'David K. Liu',
    patientPhone: '+14153217782',
    service: 'Composite Filling',
    date: '2026-10-19',
    time: '11:30 AM',
    dentistName: 'Dr. Sarah Jenkins',
    status: 'confirmed',
    reminder24hSent: false
  },
  {
    id: 'b-3',
    patientId: 'p-3',
    patientName: 'Lucas Vance',
    patientPhone: '+14155550188',
    service: 'Laser Teeth Whitening',
    date: '2026-10-20',
    time: '10:30 AM',
    dentistName: 'Dr. Emily Rivera',
    status: 'confirmed',
    reminder24hSent: false
  },
  {
    id: 'b-4',
    patientId: 'p-4',
    patientName: 'Marcus Sterling',
    patientPhone: '+14156124491',
    service: 'Tooth pain assessment',
    date: '2026-10-18',
    time: '10:00 AM',
    dentistName: 'Dr. Emily Rivera',
    status: 'pending', // Pending, should NOT be reminded
    reminder24hSent: false
  },
  {
    id: 'b-5',
    patientId: 'p-5',
    patientName: 'James Miller',
    patientPhone: '+14159021134',
    service: 'Routine Cleaning',
    date: '2026-10-25', // Next week, beyond 48 hours
    time: '09:00 AM',
    dentistName: 'Dr. Sarah Jenkins',
    status: 'confirmed',
    reminder24hSent: false
  }
];

test('isWithinNext48Hours correctly identifies dates within 48h window', () => {
  assert.equal(isWithinNext48Hours('2026-10-18', '2026-10-18'), true, 'Today should be in 48h');
  assert.equal(isWithinNext48Hours('2026-10-19', '2026-10-18'), true, 'Tomorrow should be in 48h');
  assert.equal(isWithinNext48Hours('2026-10-20', '2026-10-18'), true, 'Day +2 should be in 48h');
  assert.equal(isWithinNext48Hours('2026-10-25', '2026-10-18'), false, 'Next week should not be in 48h');
  assert.equal(isWithinNext48Hours('2026-10-15', '2026-10-18'), false, 'Past dates should not be in 48h');
});

test('getBookingsForNext48Hours filters confirmed bookings in 48h window', () => {
  const eligibleAll = getBookingsForNext48Hours(mockBookings, '2026-10-18', false);
  assert.equal(eligibleAll.length, 3, 'Should include 3 confirmed bookings in next 48h');
  assert.ok(eligibleAll.every((b) => b.status === 'confirmed'));
  assert.ok(!eligibleAll.some((b) => b.id === 'b-4'), 'Should exclude pending booking b-4');
  assert.ok(!eligibleAll.some((b) => b.id === 'b-5'), 'Should exclude out-of-range booking b-5');

  const eligibleUnsentOnly = getBookingsForNext48Hours(mockBookings, '2026-10-18', true);
  assert.equal(eligibleUnsentOnly.length, 2, 'Should include 2 unsent confirmed bookings');
  assert.ok(!eligibleUnsentOnly.some((b) => b.id === 'b-1'), 'Should exclude already sent b-1');
});

test('calculateReminderStats computes counts accurately', () => {
  const stats = calculateReminderStats(mockBookings, '2026-10-18');
  assert.equal(stats.totalNext48h, 3);
  assert.equal(stats.unsentCount, 2);
  assert.equal(stats.alreadySentCount, 1);
});

test('formatReminderMessage substitutes placeholders correctly', () => {
  const template = 'Hello {patient_name}, reminder for {service} on {date} at {time} with {dentist_name}.';
  const formatted = formatReminderMessage(template, {
    patientName: 'David K. Liu',
    dentistName: 'Dr. Sarah Jenkins',
    date: '2026-10-19',
    time: '11:30 AM',
    service: 'Composite Filling'
  });

  assert.equal(
    formatted,
    'Hello David K. Liu, reminder for Composite Filling on 2026-10-19 at 11:30 AM with Dr. Sarah Jenkins.'
  );
});
