const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.publicvoid.im';

let _sessionId: string | null = null;
function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = sessionStorage.getItem('sto_sid') || crypto.randomUUID();
    sessionStorage.setItem('sto_sid', _sessionId);
  }
  return _sessionId;
}

function fbq(...args: unknown[]) {
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  w.fbq?.(...args);
}

export function track(
  eventName: string,
  properties?: Record<string, unknown>,
  options?: { pixel?: string; pixelData?: Record<string, unknown> },
) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  if (options?.pixel) {
    fbq('track', options.pixel, options.pixelData);
  }

  fetch(`${API}/casting/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: getSessionId(),
      event_type: 'track',
      event_name: eventName,
      path,
      properties,
    }),
    keepalive: true,
  }).catch(() => {});
}

const _firedSections = new Set<string>();

export function trackOnce(eventName: string, properties?: Record<string, unknown>, options?: Parameters<typeof track>[2]) {
  const key = `${eventName}:${properties?.section || ''}`;
  if (_firedSections.has(key)) return;
  _firedSections.add(key);
  track(eventName, properties, options);
}
