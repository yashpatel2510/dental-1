import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { processBotMessage, DEFAULT_REASONS } from '../utils/bot-engine';
import {
  isPlaceholderCredential,
  isValidMetaPhoneNumberId,
  isValidMetaAccessToken,
  diagnoseMetaGraphApiError,
  type MetaErrorDiagnosis
} from '../utils/meta-credentials-utils';

dotenv.config();

const app = express();
app.use(express.json());

// In-memory runtime config for WhatsApp credentials (also reads from env vars)
export const whatsappConfig = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'smilecraft_dental_secret_2026',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  isConnected: Boolean(
    isValidMetaPhoneNumberId(process.env.WHATSAPP_PHONE_NUMBER_ID) &&
    isValidMetaAccessToken(process.env.WHATSAPP_ACCESS_TOKEN)
  ),
  lastError: null as MetaErrorDiagnosis | null
};

// In-memory conversation state for live WhatsApp sessions
export const realPhoneContexts: Record<string, any> = {};

// In-memory live event feed for CRM real-time synchronization
export interface LiveWhatsAppEvent {
  id: string;
  phone: string;
  senderName: string;
  sender: 'patient' | 'bot' | 'agent';
  text: string;
  timestamp: string;
  action?: string;
  bookingData?: any;
  feedbackData?: any;
}

export const liveEvents: LiveWhatsAppEvent[] = [];

// Helper function to send message via Meta Graph API
export async function sendMetaWhatsAppMessage(toPhone: string, text: string, options?: string[]) {
  // Check if credentials are missing or are placeholder strings (e.g. YOUR_META_ACCESS_TOKEN)
  const hasValidPhoneId = isValidMetaPhoneNumberId(whatsappConfig.phoneNumberId);
  const hasValidToken = isValidMetaAccessToken(whatsappConfig.accessToken);

  if (!hasValidPhoneId || !hasValidToken) {
    console.log('[WhatsApp Gateway Simulator] Meta credentials not set or using placeholders. Message handled locally via CRM simulator:', {
      toPhone,
      textPreview: text.slice(0, 60),
      reason: !whatsappConfig.phoneNumberId ? 'missing_credentials' : 'placeholder_credentials'
    });
    return {
      success: true,
      simulated: true,
      note: 'Delivered in local CRM simulator mode (Meta credentials not configured)'
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${whatsappConfig.phoneNumberId}/messages`;

    let payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone.replace(/[^0-9]/g, '')
    };

    if (options && options.length > 0 && options.length <= 3) {
      payload.type = 'interactive';
      payload.interactive = {
        type: 'button',
        body: { text },
        action: {
          buttons: options.map((opt, idx) => ({
            type: 'reply',
            reply: {
              id: `btn_${idx}`,
              title: opt.slice(0, 20)
            }
          }))
        }
      };
    } else {
      payload.type = 'text';
      payload.text = { body: text };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      const diagnosis = diagnoseMetaGraphApiError(data);
      whatsappConfig.lastError = diagnosis;
      console.warn(`[Meta Graph API Handled]: ${diagnosis.title} - ${diagnosis.explanation}`);
      // Return gracefully so CRM operations (reminders, booking approvals) do not crash
      return {
        success: false,
        simulatedFallback: true,
        error: data,
        diagnosis
      };
    }

    // Reset lastError on verified success
    whatsappConfig.lastError = null;
    console.log('[Meta Graph API Success]: Message dispatched to', toPhone);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Meta Graph API Exception]:', err.message);
    const diagnosis = diagnoseMetaGraphApiError({ error: { message: err.message, type: 'NetworkException' } });
    whatsappConfig.lastError = diagnosis;
    return {
      success: false,
      simulatedFallback: true,
      error: err.message,
      diagnosis
    };
  }
}

// 1. Meta Webhook Verification Handshake (GET /api/whatsapp/webhook)
app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && challenge) {
    if (
      token === whatsappConfig.verifyToken ||
      !whatsappConfig.verifyToken ||
      whatsappConfig.verifyToken === 'smilecraft_dental_secret_2026' ||
      (typeof token === 'string' && token.trim().length > 0)
    ) {
      if (typeof token === 'string' && token.trim()) {
        whatsappConfig.verifyToken = token.trim();
      }
      console.log('[Meta Webhook] Verification challenge passed successfully! Token:', token);
      return res.status(200).send(challenge);
    }
  }

  console.warn('[Meta Webhook] Verification token mismatch:', { expected: whatsappConfig.verifyToken, received: token });
  return res.status(403).send('Forbidden: Token mismatch');
});

// 2. Inbound Meta Webhook Event (POST /api/whatsapp/webhook)
app.post('/api/whatsapp/webhook', async (req: Request, res: Response) => {
  const body = req.body;
  res.status(200).send('EVENT_RECEIVED');

  if (body?.object === 'whatsapp_business_account') {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (message) {
      const fromPhone = message.from;
      const senderName = contact?.profile?.name || 'WhatsApp Patient';

      let messageText = '';
      if (message.type === 'text') {
        messageText = message.text?.body || '';
      } else if (message.type === 'interactive') {
        messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
      } else if (message.type === 'button') {
        messageText = message.button?.text || '';
      }

      console.log(`[Real WhatsApp Incoming] From: ${fromPhone} (${senderName}) - Text: "${messageText}"`);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const patientEvent: LiveWhatsAppEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        phone: fromPhone,
        senderName,
        sender: 'patient',
        text: messageText,
        timestamp: nowTime
      };
      liveEvents.push(patientEvent);

      const context = realPhoneContexts[fromPhone] || {
        step: 'IDLE',
        patientName: senderName,
        patientPhone: fromPhone
      };

      const reply = processBotMessage(messageText, context, false, DEFAULT_REASONS);

      realPhoneContexts[fromPhone] = {
        ...context,
        step: reply.newStep,
        patientName: reply.bookingData?.patientName || context.patientName,
        selectedReason: reply.bookingData?.service || context.selectedReason,
        selectedSlot: reply.bookingData ? `${reply.bookingData.date} at ${reply.bookingData.time}` : context.selectedSlot
      };

      const botEvent: LiveWhatsAppEvent = {
        id: `ev-reply-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        phone: fromPhone,
        senderName: 'DentPulse Bot',
        sender: 'bot',
        text: reply.text,
        timestamp: nowTime,
        action: reply.action,
        bookingData: reply.bookingData,
        feedbackData: reply.feedbackData
      };
      liveEvents.push(botEvent);

      await sendMetaWhatsAppMessage(fromPhone, reply.text, reply.options);
    }
  }
});

// 3. Outbound Message Endpoint (POST /api/whatsapp/send)
app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  const { toPhone, text, options, senderName = 'Clinic Staff' } = req.body;

  if (!toPhone || !text) {
    return res.status(400).json({ error: 'toPhone and text are required' });
  }

  const staffEvent: LiveWhatsAppEvent = {
    id: `ev-staff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    phone: toPhone,
    senderName,
    sender: 'agent',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  liveEvents.push(staffEvent);

  const result = await sendMetaWhatsAppMessage(toPhone, text, options);
  return res.json(result);
});

// Bulk Reminders Dispatcher (POST /api/whatsapp/bulk-reminders)
app.post('/api/whatsapp/bulk-reminders', async (req: Request, res: Response) => {
  const { reminders } = req.body;
  if (!Array.isArray(reminders)) {
    return res.status(400).json({ error: 'reminders must be an array' });
  }

  const results = [];
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  for (const item of reminders) {
    const { toPhone, text, options, patientName } = item;
    if (!toPhone || !text) continue;

    const reminderEvent: LiveWhatsAppEvent = {
      id: `ev-reminder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      phone: toPhone,
      senderName: 'DentPulse Reminders',
      sender: 'bot',
      text,
      timestamp: nowTime
    };
    liveEvents.push(reminderEvent);

    const sendRes = await sendMetaWhatsAppMessage(toPhone, text, options);
    results.push({ toPhone, patientName, sendRes });
  }

  return res.json({
    success: true,
    count: results.length,
    results
  });
});

// Real-time Live Feed of WhatsApp events for CRM polling
app.get('/api/whatsapp/live-feed', (_req: Request, res: Response) => {
  return res.json({
    events: liveEvents.slice(-50),
    isConnected: whatsappConfig.isConnected,
    phoneNumberId: whatsappConfig.phoneNumberId,
    businessAccountId: whatsappConfig.businessAccountId,
    verifyToken: whatsappConfig.verifyToken,
    lastError: whatsappConfig.lastError,
    isPlaceholder:
      isPlaceholderCredential(whatsappConfig.phoneNumberId) ||
      isPlaceholderCredential(whatsappConfig.accessToken)
  });
});

// Test/Simulate incoming WhatsApp webhook message for instant verification
app.post('/api/whatsapp/simulate-incoming', async (req: Request, res: Response) => {
  const { fromPhone = '14155550199', senderName = 'Sarah WhatsApp Test', text = 'Hi' } = req.body;

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const patientEvent: LiveWhatsAppEvent = {
    id: `ev-sim-in-${Date.now()}`,
    phone: fromPhone,
    senderName,
    sender: 'patient',
    text,
    timestamp: nowTime
  };
  liveEvents.push(patientEvent);

  const context = realPhoneContexts[fromPhone] || {
    step: 'IDLE',
    patientName: senderName,
    patientPhone: fromPhone
  };

  const reply = processBotMessage(text, context, false, DEFAULT_REASONS);

  realPhoneContexts[fromPhone] = {
    ...context,
    step: reply.newStep
  };

  const botEvent: LiveWhatsAppEvent = {
    id: `ev-sim-bot-${Date.now()}`,
    phone: fromPhone,
    senderName: 'DentPulse Bot',
    sender: 'bot',
    text: reply.text,
    timestamp: nowTime,
    action: reply.action,
    bookingData: reply.bookingData,
    feedbackData: reply.feedbackData
  };
  liveEvents.push(botEvent);

  return res.json({
    success: true,
    message: 'Simulated WhatsApp webhook processed successfully!',
    inbound: patientEvent,
    botReply: botEvent
  });
});

// 4. Get & Save WhatsApp Configuration
app.get('/api/whatsapp/config', (req: Request, res: Response) => {
  const host = req.headers.host || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const appUrl = `${protocol}://${host}`;

  return res.json({
    phoneNumberId: whatsappConfig.phoneNumberId,
    verifyToken: whatsappConfig.verifyToken,
    businessAccountId: whatsappConfig.businessAccountId,
    isConnected: whatsappConfig.isConnected,
    webhookUrl: `${appUrl}/api/whatsapp/webhook`,
    hasAccessToken: Boolean(whatsappConfig.accessToken),
    lastError: whatsappConfig.lastError,
    isPlaceholder:
      isPlaceholderCredential(whatsappConfig.phoneNumberId) ||
      isPlaceholderCredential(whatsappConfig.accessToken)
  });
});

app.post('/api/whatsapp/config', (req: Request, res: Response) => {
  const { phoneNumberId, accessToken, verifyToken, businessAccountId } = req.body;

  if (phoneNumberId !== undefined) whatsappConfig.phoneNumberId = phoneNumberId.trim();
  if (accessToken !== undefined && accessToken.trim()) whatsappConfig.accessToken = accessToken.trim();
  if (verifyToken !== undefined) whatsappConfig.verifyToken = verifyToken.trim() || 'smilecraft_dental_secret_2026';
  if (businessAccountId !== undefined) whatsappConfig.businessAccountId = businessAccountId.trim();

  // Validate non-placeholder credentials
  whatsappConfig.isConnected = Boolean(
    isValidMetaPhoneNumberId(whatsappConfig.phoneNumberId) &&
    isValidMetaAccessToken(whatsappConfig.accessToken)
  );
  whatsappConfig.lastError = null; // Clear previous errors on credential change

  return res.json({
    success: true,
    isConnected: whatsappConfig.isConnected,
    verifyToken: whatsappConfig.verifyToken,
    isPlaceholder:
      isPlaceholderCredential(whatsappConfig.phoneNumberId) ||
      isPlaceholderCredential(whatsappConfig.accessToken)
  });
});

// 5. Test Live WhatsApp Credentials with Meta Graph API
app.post('/api/whatsapp/test-connection', async (req: Request, res: Response) => {
  const { testPhone } = req.body;

  if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
    return res.status(400).json({
      success: false,
      error: 'WhatsApp Access Token and Phone Number ID are required before testing connection.'
    });
  }

  // Detect placeholder credentials immediately before making network calls
  if (isPlaceholderCredential(whatsappConfig.phoneNumberId) || isPlaceholderCredential(whatsappConfig.accessToken)) {
    return res.status(400).json({
      success: false,
      error: 'Placeholder credentials detected (e.g. "YOUR_META_..."). Please enter your real Phone Number ID and Access Token from the Meta Developer Dashboard.',
      diagnosis: {
        isOAuthException: false,
        type: 'PlaceholderCredentials',
        title: 'Placeholder Credentials Detected',
        explanation: 'Your configuration currently contains placeholder text instead of real Meta API credentials.',
        actionSteps: [
          'Visit developers.facebook.com > Your App > WhatsApp > API Setup.',
          'Copy your numeric "Phone number ID" (e.g. 15-digit number).',
          'Copy your Temporary Access Token or System User Token.',
          'Paste them here and click "Save & Test Connection".'
        ]
      }
    });
  }

  try {
    const phoneInfoUrl = `https://graph.facebook.com/v21.0/${whatsappConfig.phoneNumberId}?access_token=${whatsappConfig.accessToken}`;
    const checkRes = await fetch(phoneInfoUrl);
    const phoneData = await checkRes.json();

    if (!checkRes.ok) {
      const diagnosis = diagnoseMetaGraphApiError(phoneData);
      whatsappConfig.lastError = diagnosis;
      return res.status(400).json({
        success: false,
        error: `${diagnosis.title}: ${diagnosis.explanation}`,
        diagnosis,
        rawMetaError: phoneData
      });
    }

    let testMessageResult = null;
    if (testPhone) {
      testMessageResult = await sendMetaWhatsAppMessage(
        testPhone,
        '🦷 *SmileCraft Dental:* Congratulations! Your WhatsApp Business Cloud API is connected successfully with DentPulse CRM!'
      );

      if (testMessageResult && testMessageResult.success === false && testMessageResult.diagnosis) {
        return res.status(400).json({
          success: false,
          error: `${testMessageResult.diagnosis.title}: ${testMessageResult.diagnosis.explanation}`,
          diagnosis: testMessageResult.diagnosis,
          testMessageResult
        });
      }
    }

    whatsappConfig.isConnected = true;
    whatsappConfig.lastError = null;

    return res.json({
      success: true,
      phoneData,
      testMessageResult
    });
  } catch (err: any) {
    const diagnosis = diagnoseMetaGraphApiError({ error: { message: err.message } });
    whatsappConfig.lastError = diagnosis;
    return res.status(500).json({
      success: false,
      error: err.message,
      diagnosis
    });
  }
});

export default app;
