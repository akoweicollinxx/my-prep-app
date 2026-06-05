import posthog from 'posthog-js';

const REDACTED = '[REDACTED]';
const PII_KEYS = new Set(['userId', 'ip', 'email', 'phone']);

function sanitizeProperties(properties?: Record<string, unknown>): Record<string, unknown> {
  if (!properties) return {};
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      PII_KEYS.has(key) ? REDACTED : value,
    ])
  );
}

export function track(event: string, properties?: Record<string, unknown>): void {
  const safeProperties = sanitizeProperties(properties);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics]', event, Object.keys(safeProperties).length ? safeProperties : '');
  }

  // posthog-js is browser-only — API routes also import track(), so guard for server
  if (typeof window === 'undefined') return;

  try {
    posthog.capture(event, safeProperties);
  } catch {
    // PostHog not initialised or unavailable — fail silently
  }
}