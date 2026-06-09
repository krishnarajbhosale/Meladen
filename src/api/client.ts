/** Base URL for API calls (empty = same origin). Exported for rare raw `fetch` usage. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Turn raw nginx/Spring HTML or JSON error bodies into a short admin-friendly message. */
export function formatHttpError(status: number, body: string, fallback: string): string {
  if (status === 413) {
    return (
      'Upload rejected: file is too large for the web server (nginx 413). ' +
      'On the server, set client_max_body_size 55M in nginx and reload nginx. ' +
      'Images must also be 5 MB or smaller.'
    );
  }
  const trimmed = body.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { message?: string; error?: string };
      if (parsed.message) return parsed.message;
      if (parsed.error) return parsed.error;
    } catch {
      /* fall through */
    }
  }
  if (trimmed.includes('413 Request Entity Too Large')) {
    return formatHttpError(413, '', fallback);
  }
  if (trimmed.length > 280) return fallback;
  return trimmed;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, formatHttpError(res.status, text, `${res.status} ${res.statusText}`));
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function authHeaders(token: string): HeadersInit {
  const bearer = `Bearer ${token.trim()}`;
  return {
    Authorization: bearer,
    // Survives reverse proxies that drop Authorization; backend bridges this in AuthorizationHeaderBridgeFilter.
    'X-Meladen-Authorization': bearer,
  };
}
