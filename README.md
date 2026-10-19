# DentPulse - WhatsApp Dental Booking Assistant & Clinic CRM

DentPulse is an intelligent, automated WhatsApp booking assistant and dental practice management CRM. It allows dental clinics to handle incoming patient appointment requests 24/7 over WhatsApp, manage bookings, trigger automated 48-hour bulk reminders, collect patient reviews, and sync with clinic workflows.

---

## 🚀 Key Features

- **Automated WhatsApp Booking Assistant**:
  - 24/7 conversational triage for appointment scheduling, reason for visit selection, and slot preferences.
  - Handles appointment requests, reschedules, and cancellations automatically.
  - Staff takeover mode ("Pause Bot / Take Over") allowing clinic receptionists to seamlessly intervene in live chats.

- **Bulk WhatsApp Reminders (Next 48 Hours)**:
  - 1-click bulk reminder dispatch for all patients with bookings in the next 48 hours.
  - Customizable WhatsApp templates with dynamic tags (`{patient_name}`, `{dentist_name}`, `{date}`, `{time}`, `{service}`).
  - Direct patient confirmation or reschedule prompts sent via WhatsApp.

- **Comprehensive Clinic CRM**:
  - **Appointment Pipeline & Bookings**: Filter by pending, confirmed, or visit history; reschedule or approve with one click.
  - **Live Patient Chats**: Dual WhatsApp/CRM interface with read receipts, chat search, and message history.
  - **Patient Records & History**: Lifetime visits, notes, procedure tags, and lifetime value tracking.
  - **Google Sheets 2-Way Sync**: Live export and sync of bookings, patient records, and feedback.
  - **Patient Feedback & Ratings**: Automated post-treatment WhatsApp review collection with 5-star ratings and testimonials.
  - **Interactive WhatsApp Patient Simulator**: Test patient booking flows directly within the app before going live.

- **Real Meta WhatsApp Cloud API Integration**:
  - Supports official Meta Cloud API with webhook verification (`/api/whatsapp/webhook`).
  - Supports live incoming and outbound message dispatching.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, tsx
- **Build Tool**: Vite
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`)

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yashpatel2510/whatsapp-bot.git
   cd whatsapp-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Meta WhatsApp Cloud API credentials if connecting to live WhatsApp:
   ```env
   PORT=3000
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_permanent_or_system_user_token
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
   WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Tests**:
   ```bash
   npm test
   ```

---

## 📱 Meta WhatsApp Webhook Setup

1. Go to [developers.facebook.com](https://developers.facebook.com) and create or select your WhatsApp Business App.
2. In the WhatsApp > Configuration section:
   - **Callback URL**: `https://<YOUR_DOMAIN>/api/whatsapp/webhook`
   - **Verify Token**: Enter the same verify token set in your settings or `.env`.
3. Subscribe to webhook field: `messages`.
4. Now incoming patient WhatsApp messages will instantly route to DentPulse!

---

## 📄 License

MIT
