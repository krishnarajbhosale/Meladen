const API_BASE = '/api/auth';

/** Fired when customer login state changes (same tab). Navbar listens to update the account icon. */
export const CUSTOMER_AUTH_CHANGED_EVENT = 'meladen-customer-auth-changed';

function dispatchAuthChanged(): void {
  window.dispatchEvent(new Event(CUSTOMER_AUTH_CHANGED_EVENT));
}

function getToken(): string {
  return localStorage.getItem('meladen_customer_token') || '';
}

export async function requestCustomerOtp(email: string): Promise<{
  success?: boolean;
  message?: string;
  devOtp?: string;
}> {
  const res = await fetch(`${API_BASE}/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const text = await res.text().catch(() => '');
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = {};
  }
  if (!res.ok || data.success === false) {
    throw new Error(String(data.message || text || 'Failed to send OTP'));
  }
  return data as { success?: boolean; message?: string; devOtp?: string };
}

export async function verifyCustomerOtp(email: string, otp: string): Promise<void> {
  const res = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const text = await res.text().catch(() => '');
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = {};
  }
  if (!res.ok || !data.success || typeof data.token !== 'string') {
    throw new Error(String(data.message || text || 'Invalid OTP'));
  }
  localStorage.setItem('meladen_customer_token', data.token);
  localStorage.setItem('meladen_customer_email', String(email || '').trim().toLowerCase());
  dispatchAuthChanged();
}

/**
 * Signs out immediately in the browser (localStorage cleared first), then notifies the server in the
 * background so one click is never blocked by network latency.
 */
export function customerLogout(): void {
  const token = getToken();
  localStorage.removeItem('meladen_customer_token');
  localStorage.removeItem('meladen_customer_email');
  dispatchAuthChanged();
  if (token) {
    void fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
}

export function isCustomerLoggedIn(): boolean {
  return !!getToken();
}

export function getCustomerEmail(): string {
  return localStorage.getItem('meladen_customer_email') || '';
}

export function customerAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type GuardCheckoutNavigate = (
  path: string,
  options?: { state?: Record<string, unknown> },
) => void;

/**
 * If the user is not signed in, runs `onBeforeLoginRedirect` (e.g. close cart drawer), then navigates to login.
 * Returns true when safe to navigate to `/checkout`.
 */
export function guardCheckout(
  navigate: GuardCheckoutNavigate,
  onBeforeLoginRedirect?: () => void,
): boolean {
  if (isCustomerLoggedIn()) return true;
  onBeforeLoginRedirect?.();
  navigate('/login', { state: { from: '/checkout' } });
  return false;
}
