import test from 'node:test';
import assert from 'node:assert/strict';
import { processBotMessage, DEFAULT_REASONS } from './bot-engine.ts';

test('Bot starts with greeting and asks name when IDLE', () => {
  const reply = processBotMessage('Hi', { step: 'IDLE' });
  assert.equal(reply.newStep, 'AWAITING_NAME');
  assert.ok(reply.text.includes('Welcome to SmileCraft Dental Clinic'));
});

test('Bot asks for phone number after receiving patient name', () => {
  const reply = processBotMessage('Sarah Connor', { step: 'AWAITING_NAME' });
  assert.equal(reply.newStep, 'AWAITING_PHONE');
  assert.ok(reply.text.includes('Sarah Connor'));
});

test('Bot shows reason-for-visit menu after phone number', () => {
  const reply = processBotMessage('+1 (555) 987-6543', {
    step: 'AWAITING_PHONE',
    patientName: 'Sarah Connor'
  });
  assert.equal(reply.newStep, 'AWAITING_REASON');
  assert.ok(reply.text.includes('Checkup'));
  assert.ok(reply.text.includes('Tooth pain'));
  assert.deepEqual(reply.options, DEFAULT_REASONS);
});

test('Bot asks for date and time slot after selecting reason', () => {
  const reply = processBotMessage('Tooth pain', {
    step: 'AWAITING_REASON',
    patientName: 'Sarah Connor',
    patientPhone: '+1 (555) 987-6543'
  });
  assert.equal(reply.newStep, 'AWAITING_DATETIME');
  assert.ok(reply.text.includes('When would you like to come in?'));
});

test('Bot asks for specific details after picking slot', () => {
  const reply = processBotMessage('Tomorrow 10:00 AM', {
    step: 'AWAITING_DATETIME',
    patientName: 'Sarah Connor',
    reason: 'Tooth pain'
  });
  assert.equal(reply.newStep, 'AWAITING_DETAILS');
  assert.ok(reply.text.includes('specific details or symptoms'));
});

test('Bot confirms pending booking after receiving details', () => {
  const reply = processBotMessage('Pain in upper left molar when drinking ice water', {
    step: 'AWAITING_DETAILS',
    patientName: 'Sarah Connor',
    patientPhone: '+1 (555) 987-6543',
    reason: 'Tooth pain',
    preferredDate: 'Tomorrow',
    preferredTime: '10:00 AM'
  });
  assert.equal(reply.newStep, 'COMPLETED');
  assert.equal(reply.action, 'create_booking');
  assert.ok(reply.text.includes('Request sent, clinic will confirm shortly'));
  assert.equal(reply.bookingData?.patientName, 'Sarah Connor');
});

test('Bot handles reschedule command smoothly', () => {
  const reply = processBotMessage('reschedule', {
    step: 'IDLE',
    patientName: 'Sarah Connor'
  });
  assert.equal(reply.newStep, 'AWAITING_RESCHEDULE_DATETIME');
  assert.ok(reply.text.includes('Reschedule Appointment'));
});

test('Bot pauses replies when staff has taken over', () => {
  const reply = processBotMessage('Are you there?', { step: 'IDLE' }, true);
  assert.equal(reply.text, '');
  assert.equal(reply.action, 'none');
});

test('Bot answers clinic hours FAQ correctly', () => {
  const reply = processBotMessage('What are your hours today?', { step: 'IDLE' });
  assert.ok(reply.text.includes('Clinic Hours'));
  assert.ok(reply.text.includes('Mon – Fri'));
});

test('Bot saves feedback rating and comments', () => {
  const reply = processBotMessage('5 stars Dr. Sarah was super gentle and thorough!', {
    step: 'AWAITING_FEEDBACK',
    patientName: 'Sarah Connor'
  });
  assert.equal(reply.action, 'save_feedback');
  assert.equal(reply.feedbackData?.rating, 5);
  assert.ok(reply.text.includes('⭐⭐⭐⭐⭐'));
});
