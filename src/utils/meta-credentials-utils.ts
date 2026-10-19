/**
 * Utility functions for validating Meta WhatsApp Cloud API credentials
 * and diagnosing Meta Graph API responses/errors.
 */

export interface MetaErrorDiagnosis {
  isOAuthException: boolean;
  code?: number;
  subcode?: number;
  type: string;
  title: string;
  explanation: string;
  actionSteps: string[];
}

/**
 * Checks if a credential string is a placeholder rather than real Meta credentials.
 */
export function isPlaceholderCredential(val: string | undefined | null): boolean {
  if (!val) return true;
  const trimmed = val.trim().toLowerCase();
  if (trimmed.length === 0) return true;

  // Common placeholder tokens
  const placeholderPatterns = [
    'your_',
    'your meta',
    '<your',
    'placeholder',
    'enter_your',
    'my_gemini',
    'my_app',
    'your_meta_phone_number_id',
    'your_meta_access_token',
    'your_meta_waba_id',
    'waba_id',
    'access_token'
  ];

  return placeholderPatterns.some((pattern) => trimmed.includes(pattern));
}

/**
 * Validates a Meta WhatsApp Phone Number ID.
 * Real Meta Phone Number IDs are numeric sequences (typically 12-18 digits).
 */
export function isValidMetaPhoneNumberId(val: string | undefined | null): boolean {
  if (isPlaceholderCredential(val)) return false;
  const clean = (val || '').trim();
  // Must be strictly digits and at least 6 digits long
  return /^\d{6,25}$/.test(clean);
}

/**
 * Validates a Meta WhatsApp Access Token.
 * Real Meta tokens are non-placeholder and typically start with EA... or are at least 30 characters long.
 */
export function isValidMetaAccessToken(val: string | undefined | null): boolean {
  if (isPlaceholderCredential(val)) return false;
  const clean = (val || '').trim();
  return clean.length >= 20 && !isPlaceholderCredential(clean);
}

/**
 * Diagnoses a Meta Graph API error response (such as OAuthException) and returns
 * human-readable explanation and step-by-step remediation instructions.
 */
export function diagnoseMetaGraphApiError(data: any): MetaErrorDiagnosis {
  const err = data?.error || (typeof data === 'object' ? data : {});
  const type = err.type || (typeof err.message === 'string' && err.message.includes('OAuth') ? 'OAuthException' : 'Unknown');
  const code = typeof err.code === 'number' ? err.code : undefined;
  const subcode = typeof err.error_subcode === 'number' ? err.error_subcode : undefined;
  const rawMessage = err.message || '';
  const isOAuthException = type === 'OAuthException' || code === 190 || rawMessage.toLowerCase().includes('oauthexception') || rawMessage.toLowerCase().includes('access token');

  // Case 1: Code 190 - Invalid or expired OAuth access token
  if (code === 190 || isOAuthException && (rawMessage.includes('Invalid OAuth access token') || rawMessage.includes('Session has expired') || rawMessage.includes('Cannot parse the access token') || subcode === 463 || subcode === 467)) {
    return {
      isOAuthException: true,
      code: code || 190,
      subcode,
      type: 'OAuthException',
      title: 'Meta Access Token Expired or Invalid (Code 190)',
      explanation: 'The WhatsApp Access Token configured in your environment or CRM settings is invalid, expired, or has had its session terminated by Meta.',
      actionSteps: [
        'Open developers.facebook.com > Your App > WhatsApp > API Setup.',
        'Copy a fresh Temporary Access Token (valid for 24h) for quick testing.',
        'Or create a Permanent System User Token with whatsapp_business_messaging permissions in Meta Business Suite.',
        'Paste the updated token in the CRM "Connect WhatsApp" settings or update WHATSAPP_ACCESS_TOKEN.'
      ]
    };
  }

  // Case 2: Code 131030 - Recipient phone number not in allowed test sandbox list
  if (code === 131030 || rawMessage.includes('Recipient phone number not in allowed list')) {
    return {
      isOAuthException: false,
      code: 131030,
      subcode,
      type: 'SandboxRestriction',
      title: 'Recipient Phone Not in Meta Sandbox List (Code 131030)',
      explanation: 'While using Meta Developer Test Numbers, messages can only be delivered to phone numbers explicitly verified in your Meta Sandbox "To" list.',
      actionSteps: [
        'Open developers.facebook.com > WhatsApp > API Setup.',
        'Locate "Step 2: Send and receive messages" and find the "To" phone number dropdown.',
        'Click "Manage phone number list" and add the recipient phone number with country code.',
        'Enter the SMS verification code received on that phone to authorize test deliveries.'
      ]
    };
  }

  // Case 3: Code 131047 - 24-hour customer care window closed
  if (code === 131047 || rawMessage.includes('Re-engagement message') || rawMessage.includes('24 hours')) {
    return {
      isOAuthException: false,
      code: 131047,
      subcode,
      type: 'CustomerCareWindowClosed',
      title: '24-Hour Messaging Window Expired (Code 131047)',
      explanation: 'Meta requires approved WhatsApp Message Templates to initiate conversations after 24 hours of inactivity from the patient.',
      actionSteps: [
        'Ask the patient to send any message (e.g. "Hi") to your clinic WhatsApp number to open the 24-hour reply window.',
        'Alternatively, submit and use a pre-approved Meta WhatsApp Template Message.'
      ]
    };
  }

  // Case 4: Code 100 / Permissions or invalid Phone Number ID
  if (code === 100 || rawMessage.includes('Unsupported post request') || rawMessage.includes('does not exist')) {
    return {
      isOAuthException: isOAuthException,
      code: 100,
      subcode,
      type: isOAuthException ? 'OAuthException' : 'InvalidParameter',
      title: 'Invalid Phone Number ID or Missing Permissions (Code 100)',
      explanation: 'The Phone Number ID does not match any registered WhatsApp Business account accessible by this access token, or the token lacks permissions.',
      actionSteps: [
        'Verify your Phone Number ID in developers.facebook.com > WhatsApp > API Setup (it is a 15-digit number, NOT your display phone number).',
        'Ensure your Meta System User has "whatsapp_business_messaging" and "whatsapp_business_management" permissions assigned.'
      ]
    };
  }

  // Generic OAuthException fallback
  if (isOAuthException) {
    return {
      isOAuthException: true,
      code,
      subcode,
      type: 'OAuthException',
      title: 'Meta WhatsApp Authentication Error (OAuthException)',
      explanation: rawMessage || 'Meta rejected the API request due to an authorization or credential issue.',
      actionSteps: [
        'Verify your Phone Number ID and Access Token in your Meta Developer App dashboard.',
        'Ensure the System User token has not expired and has whatsapp_business_messaging scope.',
        'Use the CRM local simulator to test full clinic booking workflows without Meta API blocking.'
      ]
    };
  }

  // Default catch-all
  return {
    isOAuthException: false,
    code,
    subcode,
    type: type || 'MetaGraphApiError',
    title: `Meta API Error (${code || type})`,
    explanation: rawMessage || 'An unexpected error occurred while communicating with the Meta Graph API.',
    actionSteps: [
      'Check the Meta API response details in the error log.',
      'Ensure the clinic WhatsApp account is active and in good standing on Meta Business Suite.'
    ]
  };
}
