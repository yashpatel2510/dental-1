import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPlaceholderCredential,
  isValidMetaPhoneNumberId,
  isValidMetaAccessToken,
  diagnoseMetaGraphApiError
} from './meta-credentials-utils.ts';

test('isPlaceholderCredential detects common placeholder tokens', () => {
  assert.equal(isPlaceholderCredential('YOUR_META_PHONE_NUMBER_ID'), true);
  assert.equal(isPlaceholderCredential('YOUR_META_ACCESS_TOKEN'), true);
  assert.equal(isPlaceholderCredential('YOUR_META_WABA_ID'), true);
  assert.equal(isPlaceholderCredential('your_token_here'), true);
  assert.equal(isPlaceholderCredential('placeholder'), true);
  assert.equal(isPlaceholderCredential(''), true);
  assert.equal(isPlaceholderCredential('   '), true);
  assert.equal(isPlaceholderCredential(undefined), true);
  assert.equal(isPlaceholderCredential(null), true);

  // Real tokens should not be marked as placeholder
  assert.equal(isPlaceholderCredential('104829104820194'), false);
  assert.equal(isPlaceholderCredential('EAABsb87a9s8df7as8d6f9a8sdf'), false);
});

test('isValidMetaPhoneNumberId validates realistic numeric Meta IDs', () => {
  assert.equal(isValidMetaPhoneNumberId('104829104820194'), true);
  assert.equal(isValidMetaPhoneNumberId('123456789012345'), true);

  // Invalid cases
  assert.equal(isValidMetaPhoneNumberId('YOUR_META_PHONE_NUMBER_ID'), false);
  assert.equal(isValidMetaPhoneNumberId('abc123'), false);
  assert.equal(isValidMetaPhoneNumberId('123'), false); // Too short
  assert.equal(isValidMetaPhoneNumberId(''), false);
  assert.equal(isValidMetaPhoneNumberId(undefined), false);
});

test('isValidMetaAccessToken validates token length and non-placeholder', () => {
  assert.equal(isValidMetaAccessToken('EAABsb87a9s8df7as8d6f9a8sdff2314'), true);
  assert.equal(isValidMetaAccessToken('YOUR_META_ACCESS_TOKEN'), false);
  assert.equal(isValidMetaAccessToken('short_token'), false);
  assert.equal(isValidMetaAccessToken(''), false);
});

test('diagnoseMetaGraphApiError handles OAuthException Code 190 (expired token)', () => {
  const metaError = {
    error: {
      message: 'Invalid OAuth access token - Cannot parse the access token',
      type: 'OAuthException',
      code: 190,
      fbtrace_id: 'A1B2C3D4'
    }
  };

  const diagnosis = diagnoseMetaGraphApiError(metaError);
  assert.equal(diagnosis.isOAuthException, true);
  assert.equal(diagnosis.code, 190);
  assert.match(diagnosis.title, /Expired or Invalid/i);
  assert.ok(diagnosis.actionSteps.length > 0);
});

test('diagnoseMetaGraphApiError handles Code 131030 (sandbox restriction)', () => {
  const metaError = {
    error: {
      message: 'Recipient phone number not in allowed list',
      type: 'OAuthException',
      code: 131030
    }
  };

  const diagnosis = diagnoseMetaGraphApiError(metaError);
  assert.equal(diagnosis.code, 131030);
  assert.equal(diagnosis.type, 'SandboxRestriction');
  assert.match(diagnosis.title, /Sandbox List/i);
});

test('diagnoseMetaGraphApiError handles Code 131047 (24h customer care window)', () => {
  const metaError = {
    error: {
      message: 'Re-engagement message: More than 24 hours have elapsed since recipient last replied.',
      type: 'OAuthException',
      code: 131047
    }
  };

  const diagnosis = diagnoseMetaGraphApiError(metaError);
  assert.equal(diagnosis.code, 131047);
  assert.equal(diagnosis.type, 'CustomerCareWindowClosed');
});
