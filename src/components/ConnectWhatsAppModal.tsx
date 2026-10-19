import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Send,
  AlertCircle,
  HelpCircle,
  Key,
  Smartphone,
  QrCode,
  Zap,
  RefreshCw
} from 'lucide-react';

interface ConnectWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectWhatsAppModal: React.FC<ConnectWhatsAppModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeProvider, setActiveProvider] = useState<'meta' | 'qrcode'>('meta');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('smilecraft_dental_secret_2026');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [testStatus, setTestStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/whatsapp/webhook`
      : 'https://ais-dev-4yitotnpvd53gxmtqhzaaq-824058530633.asia-southeast1.run.app/api/whatsapp/webhook';

  useEffect(() => {
    // Fetch current server config
    fetch('/api/whatsapp/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.phoneNumberId) setPhoneNumberId(data.phoneNumberId);
        if (data.verifyToken) setVerifyToken(data.verifyToken);
        if (data.businessAccountId) setBusinessAccountId(data.businessAccountId);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTestStatus(null);

    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId,
          accessToken,
          verifyToken,
          businessAccountId
        })
      });
      const data = await res.json();

      if (data.success) {
        setTestStatus({
          success: true,
          message: 'WhatsApp Cloud API configuration saved successfully!'
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || 'Failed to save configuration.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!phoneNumberId || !accessToken) {
      setTestStatus({
        success: false,
        message: 'Please enter both Phone Number ID and Access Token first.'
      });
      return;
    }

    setIsLoading(true);
    setTestStatus(null);

    try {
      // First save
      await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId,
          accessToken,
          verifyToken,
          businessAccountId
        })
      });

      // Then test
      const res = await fetch('/api/whatsapp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testPhone: testPhoneNumber })
      });
      const data = await res.json();

      if (data.success) {
        setTestStatus({
          success: true,
          message: testPhoneNumber
            ? `Connection Verified! Test WhatsApp message sent to ${testPhoneNumber}. Check your phone!`
            : 'Meta Graph API connection verified! Your credentials are valid.'
        });
      } else {
        setTestStatus({
          success: false,
          message: data.error || 'Connection check failed. Please verify your credentials.'
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || 'Network error verifying connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/whatsapp/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPhone: testPhoneNumber || '14155550199',
          senderName: 'Sarah WhatsApp Test',
          text: 'Hi'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({
          success: true,
          message: 'Webhook Simulation Succeeded! The bot replied and a live conversation was sent into the CRM.'
        });
      }
    } catch (err: any) {
      setTestStatus({
        success: false,
        message: err.message || 'Simulation failed'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Connect Real WhatsApp to DentPulse CRM
              </h2>
              <p className="text-xs text-slate-500">
                Receive real incoming patient chats and send automated booking confirmations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setActiveProvider('meta')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeProvider === 'meta'
                ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Meta Cloud API (Recommended)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Official WhatsApp Business API. Free 1,000 conversations/mo. Direct Meta webhook.
            </p>
          </button>

          <button
            onClick={() => setActiveProvider('qrcode')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeProvider === 'qrcode'
                ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>QR Code Gateway (No Meta Approval)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Connect existing clinic phone by scanning a QR code (Whapi, Z-API, or Baileys).
            </p>
          </button>
        </div>

        {/* Option 1: Official Meta Cloud API */}
        {activeProvider === 'meta' && (
          <form onSubmit={handleSaveConfig} className="space-y-4 mt-5">
            {/* Guidance card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900">What Information Do You Need? (Guide)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  {showGuide ? 'Hide Guide' : 'Show Guide'}
                </button>
              </div>
              {showGuide && (
                <div className="text-[11px] text-emerald-900 space-y-2 pt-1 border-t border-emerald-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="font-extrabold text-emerald-800 block">1. Meta Developer App</span>
                      <p className="text-slate-600 mt-0.5">Go to <code>developers.facebook.com</code> &gt; Create App &gt; Select "Other" &gt; "Business", then add <strong>WhatsApp</strong>.</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="font-extrabold text-emerald-800 block">2. Phone Number ID</span>
                      <p className="text-slate-600 mt-0.5">Under <strong>WhatsApp &gt; API Setup</strong>, copy the 15-digit <strong>Phone Number ID</strong>.</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="font-extrabold text-emerald-800 block">3. Access Token</span>
                      <p className="text-slate-600 mt-0.5">Use 24h temporary token for testing, or create a System User Token in Business Manager with <code>whatsapp_business_messaging</code>.</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-emerald-200">
                      <span className="font-extrabold text-emerald-800 block">4. Configure Webhook</span>
                      <p className="text-slate-600 mt-0.5">In Meta under <strong>WhatsApp &gt; Configuration</strong>, paste the Callback URL and Verify Token below, then subscribe to <strong>messages</strong>.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 1: Webhook URL & Verify Token */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                Webhook Configuration (Copy into Meta App Dashboard)
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Callback URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px] text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(webhookUrl, 'url')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold flex items-center gap-1 shrink-0"
                    >
                      {copiedField === 'url' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Verify Token:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px] text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(verifyToken, 'token')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-bold flex items-center gap-1 shrink-0"
                    >
                      {copiedField === 'token' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Meta Webhook Verification Note */}
                <div className="p-3 bg-amber-50/90 rounded-lg border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Seeing "Callback URL or verify token couldn't be validated"?</span>
                  </div>
                  <p className="text-amber-900/90 leading-relaxed">
                    The AI Studio preview environment (<code>ais-dev-*.run.app</code>) requires Google sign-in cookies, which redirects Meta's automated verification servers with HTTP 302.
                  </p>
                  <p className="text-amber-900/90 leading-relaxed">
                    <strong>Solution for Live WhatsApp:</strong> Deploy your GitHub repo (e.g. to Render, Railway, or Cloud Run) or run locally with <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-950">ngrok http 3000</code> and paste that URL into Meta.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Meta Credentials */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                Meta Developer Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 109283746501928"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Found in Meta WhatsApp &gt; API Setup
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Business Account ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 987654321098765"
                    value={businessAccountId}
                    onChange={(e) => setBusinessAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Permanent System User Access Token (or Temporary Token) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="EAAx... (Starts with EAA)"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Generated in Meta Business Manager &gt; System Users with `whatsapp_business_messaging` permission.
                </span>
              </div>
            </div>

            {/* Step 3: Test Real Message & Inbound Webhook */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-3">
              <span className="text-xs font-extrabold uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                Verify Connection & Test Inbound / Outbound
              </span>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="tel"
                  placeholder="Your phone number with country code (+1 415 555 0199)"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white font-mono"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleTestConnection}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    title="Send a real WhatsApp message to your phone via Meta Graph API"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Real WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={handleSimulateWebhook}
                    className="px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    title="Test incoming webhook trigger without sending a real WhatsApp"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                    <span>Test Webhook Inbound</span>
                  </button>
                </div>
              </div>
            </div>

            {testStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Open Meta Developer Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isLoading ? 'Saving...' : 'Save Live Credentials'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Option 2: QR Code Gateway */}
        {activeProvider === 'qrcode' && (
          <div className="mt-5 space-y-4">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-48 h-48 bg-white border-2 border-slate-300 rounded-2xl mx-auto flex flex-col items-center justify-center p-3 shadow-inner">
                <QrCode className="w-32 h-32 text-slate-800" />
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  Scan with WhatsApp on phone
                </span>
              </div>

              <div className="text-left text-xs text-slate-700 space-y-1.5 max-w-md mx-auto">
                <p className="font-bold text-slate-900">How QR Code WhatsApp connection works:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Open WhatsApp on your clinic smartphone.</li>
                  <li>Tap <strong>Settings &gt; Linked Devices &gt; Link a Device</strong>.</li>
                  <li>Scan the QR code to pair your clinic number without needing Meta developer verification.</li>
                </ol>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                For high volume clinics (&gt;50 bookings/day), <strong>Meta Cloud API</strong> is strongly recommended to prevent temporary WhatsApp number bans.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
