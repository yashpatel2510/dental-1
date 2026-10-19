import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { processBotMessage, DEFAULT_REASONS } from './src/utils/bot-engine';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory runtime config for WhatsApp credentials (also reads from env vars)
let whatsappConfig = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'smilecraft_dental_secret_2026',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  isConnected: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
};

// In-memory conversation state for live WhatsApp sessions
const realPhoneContexts: Record<string, any> = {};

// 1. Meta Webhook Verification Handshake (GET /api/whatsapp/webhook)
app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && challenge) {
    // If token matches configured token, or accepts developer token and syncs it
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

// Helper function to send message via Meta Graph API
async function sendMetaWhatsAppMessage(toPhone: string, text: string, options?: string[]) {
  if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
    console.log('[WhatsApp Gateway Simulator] Meta credentials not set. Message queued locally:', { toPhone, text });
    return { success: true, simulated: true };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${whatsappConfig.phoneNumberId}/messages`;

    let payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone.replace(/[^0-9]/g, '')
    };

    // If options are provided and <= 3, Meta interactive button reply can be used; otherwise standard text
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
              title: opt.slice(0, 20) // Meta allows max 20 chars for button title
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
      console.error('[Meta Graph API Error]:', data);
      return { success: false, error: data };
    }

    console.log('[Meta Graph API Success]: Message dispatched to', toPhone);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Meta Graph API Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

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

const liveEvents: LiveWhatsAppEvent[] = [];

// 2. Inbound Meta Webhook Event (POST /api/whatsapp/webhook)
app.post('/api/whatsapp/webhook', async (req: Request, res: Response) => {
  const body = req.body;

  // Acknowledge Meta immediately with 200 OK
  res.status(200).send('EVENT_RECEIVED');

  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (message) {
      const fromPhone = message.from; // e.g. "14155550188"
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

      // Record patient incoming event into live feed
      const patientEvent: LiveWhatsAppEvent = {
        id: `ev-in-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        phone: fromPhone,
        senderName,
        sender: 'patient',
        text: messageText,
        timestamp: nowTime
      };
      liveEvents.push(patientEvent);

      // Retrieve bot session context for this real phone number
      const context = realPhoneContexts[fromPhone] || {
        step: 'IDLE',
        patientName: senderName,
        patientPhone: fromPhone
      };

      // Process message through our bot state machine
      const reply = processBotMessage(messageText, context, false, DEFAULT_REASONS);

      // Save updated step in session
      realPhoneContexts[fromPhone] = {
        ...context,
        step: reply.newStep
      };

      // Record bot reply into live feed
      if (reply.text) {
        const botEvent: LiveWhatsAppEvent = {
          id: `ev-bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

        // Keep last 100 events in memory
        if (liveEvents.length > 100) {
          liveEvents.splice(0, liveEvents.length - 100);
        }

        // Dispatch reply back to patient's real phone
        await sendMetaWhatsAppMessage(fromPhone, reply.text, reply.options);
      }
    }
  }
});

// 3. Outbound Message from CRM Staff (POST /api/whatsapp/send)
app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  const { toPhone, text, options, senderName = 'Clinic Staff' } = req.body;
  if (!toPhone || !text) {
    return res.status(400).json({ error: 'Missing toPhone or text' });
  }

  // Record outbound staff message into live feed
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

    // Record reminder event into live feed
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
    verifyToken: whatsappConfig.verifyToken
  });
});

// Test/Simulate incoming WhatsApp webhook message for instant verification
app.post('/api/whatsapp/simulate-incoming', async (req: Request, res: Response) => {
  const { fromPhone = '14155550199', senderName = 'Sarah WhatsApp Test', text = 'Hi' } = req.body;

  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: whatsappConfig.businessAccountId || 'WHATSAPP_TEST_BIZ_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550234567',
                phone_number_id: whatsappConfig.phoneNumberId || 'TEST_PHONE_ID'
              },
              contacts: [{ profile: { name: senderName }, wa_id: fromPhone }],
              messages: [
                {
                  from: fromPhone,
                  id: `wamid.HBgL${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: text },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  // Run the webhook handler logic
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
app.get('/api/whatsapp/config', (_req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://ais-dev-4yitotnpvd53gxmtqhzaaq-824058530633.asia-southeast1.run.app';
  return res.json({
    phoneNumberId: whatsappConfig.phoneNumberId,
    verifyToken: whatsappConfig.verifyToken,
    businessAccountId: whatsappConfig.businessAccountId,
    isConnected: whatsappConfig.isConnected,
    webhookUrl: `${appUrl}/api/whatsapp/webhook`,
    hasAccessToken: Boolean(whatsappConfig.accessToken)
  });
});

app.post('/api/whatsapp/config', (req: Request, res: Response) => {
  const { phoneNumberId, accessToken, verifyToken, businessAccountId } = req.body;

  if (phoneNumberId !== undefined) whatsappConfig.phoneNumberId = phoneNumberId.trim();
  if (accessToken !== undefined && accessToken.trim()) whatsappConfig.accessToken = accessToken.trim();
  if (verifyToken !== undefined) whatsappConfig.verifyToken = verifyToken.trim() || 'smilecraft_dental_secret_2026';
  if (businessAccountId !== undefined) whatsappConfig.businessAccountId = businessAccountId.trim();

  whatsappConfig.isConnected = Boolean(whatsappConfig.phoneNumberId && whatsappConfig.accessToken);

  return res.json({
    success: true,
    isConnected: whatsappConfig.isConnected,
    verifyToken: whatsappConfig.verifyToken
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

  try {
    // Check Phone Number status with Meta
    const phoneInfoUrl = `https://graph.facebook.com/v21.0/${whatsappConfig.phoneNumberId}?access_token=${whatsappConfig.accessToken}`;
    const checkRes = await fetch(phoneInfoUrl);
    const phoneData = await checkRes.json();

    if (!checkRes.ok) {
      return res.status(400).json({
        success: false,
        error: phoneData.error?.message || 'Meta API returned an error verifying Phone Number ID.'
      });
    }

    let testMessageResult = null;
    if (testPhone) {
      testMessageResult = await sendMetaWhatsAppMessage(
        testPhone,
        '🦷 *SmileCraft Dental:* Congratulations! Your WhatsApp Business Cloud API is connected successfully with DentPulse CRM!'
      );
    }

    return res.json({
      success: true,
      phoneData,
      testMessageResult
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Mount Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DentPulse WhatsApp CRM Server listening on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
