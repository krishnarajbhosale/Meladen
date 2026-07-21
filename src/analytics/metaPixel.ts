declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

const META_PIXEL_ID =
  import.meta.env.VITE_META_PIXEL_ID?.trim() || '1512914433621360';

let initialized = false;

export type MetaContent = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type MetaEventParameters = {
  value?: number;
  currency?: 'INR';
  content_ids?: string[];
  contents?: MetaContent[];
  content_type?: 'product';
  [key: string]: unknown;
};

export function initMetaPixel(): void {
  if (initialized || !META_PIXEL_ID || typeof window === 'undefined') return;
  initialized = true;

  const existing = window.fbq;
  if (!existing) {
    const fbq = function (...args: unknown[]) {
      const queueingFbq = fbq as typeof fbq & {
        callMethod?: (...methodArgs: unknown[]) => void;
        queue: unknown[][];
      };
      if (queueingFbq.callMethod) queueingFbq.callMethod(...args);
      else queueingFbq.queue.push(args);
    } as typeof window.fbq & {
      push?: typeof window.fbq;
      loaded?: boolean;
      version?: string;
      queue: unknown[][];
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  window.fbq?.('init', META_PIXEL_ID);
}

export function newMetaEventId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}

export function trackMetaEvent(
  name: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase',
  parameters: MetaEventParameters = {},
  eventId?: string,
): void {
  if (!initialized || typeof window.fbq !== 'function') return;
  if (eventId) {
    window.fbq('track', name, parameters, { eventID: eventId });
  } else {
    window.fbq('track', name, parameters);
  }
}

