declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? '';

let initialized = false;

export function isGa4Enabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

export function getGa4MeasurementId(): string {
  return GA_MEASUREMENT_ID;
}

/** Load gtag.js once. Automatic page views are disabled — SPA route changes send them manually. */
export function initGa4(): void {
  if (initialized || !isGa4Enabled()) return;
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

export function trackGa4PageView(pathname: string, search = ''): void {
  if (!isGa4Enabled() || typeof window.gtag !== 'function') return;

  const pagePath = `${pathname}${search}`;
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: document.title,
  });
}
