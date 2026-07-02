import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { isGa4Enabled, trackGa4PageView } from '../analytics/ga4';

const IGNORED_PATH_PREFIXES = ['/ladmin'];

export default function Ga4PageViewTracker() {
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    if (!isGa4Enabled()) return;
    if (IGNORED_PATH_PREFIXES.some(prefix => location.pathname.startsWith(prefix))) return;

    const pageKey = `${location.pathname}${location.search}`;
    if (pageKey === lastTracked.current) return;
    lastTracked.current = pageKey;

    trackGa4PageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
}
