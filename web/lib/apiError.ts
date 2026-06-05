/**
 * Maps API error messages to i18n translation keys.
 *
 * All user-facing error messages must go through this function.
 * Never expose raw backend error strings to the UI.
 */

export type ErrorContext =
  | 'auth'
  | 'campaign'
  | 'assignment'
  | 'donation'
  | 'profile'
  | 'generic';

interface ErrorMapping {
  match: (msg: string) => boolean;
  key: string;
}

const AUTH_MAPPINGS: ErrorMapping[] = [
  { match: (m) => m.includes('invalid credentials') || m.includes('incorrect password'), key: 'auth.error_invalid_credentials' },
  { match: (m) => m.includes('email already') || m.includes('already registered') || m.includes('unique constraint'), key: 'auth.error_email_taken' },
  { match: (m) => m === '' || m.includes('failed to fetch') || m.includes('network') || m.includes('load failed'), key: 'auth.error_network' },
];

const CAMPAIGN_MAPPINGS: ErrorMapping[] = [
  { match: (m) => m.includes('donations') || m.includes('has donation'), key: 'errors.campaign_has_donations' },
];

const ASSIGNMENT_MAPPINGS: ErrorMapping[] = [
  { match: (m) => m.includes('departure'), key: 'errors.departure_date_required' },
  { match: (m) => m.includes('arrival') || m.includes('estimatedarrival'), key: 'errors.arrival_date_required' },
];

const PROFILE_MAPPINGS: ErrorMapping[] = [
  { match: (m) => m.includes('invalid current password'), key: 'errors.invalid_current_password' },
  { match: (m) => m.includes('oauth') || m.includes('cannot change password'), key: 'errors.oauth_no_password' },
];

const CONTEXT_MAPPINGS: Record<ErrorContext, ErrorMapping[]> = {
  auth: AUTH_MAPPINGS,
  campaign: CAMPAIGN_MAPPINGS,
  assignment: ASSIGNMENT_MAPPINGS,
  donation: [],
  profile: PROFILE_MAPPINGS,
  generic: [],
};

/**
 * Returns a translation key for the given error and context.
 * Falls back to 'errors.generic' if no specific mapping is found.
 */
export function resolveErrorKey(err: unknown, context: ErrorContext = 'generic'): string {
  const msg = err instanceof Error ? err.message.toLowerCase() : '';

  // Session expired is handled globally by api.ts (redirect), but map it defensively
  if (msg === 'session_expired') return 'errors.session_expired';

  const contextMappings = CONTEXT_MAPPINGS[context];
  for (const mapping of contextMappings) {
    if (mapping.match(msg)) return mapping.key;
  }

  // Check all mappings if context-specific ones didn't match
  if (context !== 'generic') {
    for (const mapping of [...AUTH_MAPPINGS, ...CAMPAIGN_MAPPINGS, ...ASSIGNMENT_MAPPINGS]) {
      if (mapping.match(msg)) return mapping.key;
    }
  }

  return 'errors.generic';
}
