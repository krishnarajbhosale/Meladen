import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { newMetaEventId, trackMetaEvent } from '../analytics/metaPixel';

const IGNORED_PATH_PREFIXES = ['/ladmin'];

export default function MetaPageViewTracker() {
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    if (IGNORED_PATH_PREFIXES.some(prefix => location.pathname.startsWith(prefix))) return;

    const pageKey = `${location.pathname}${location.search}`;
    if (lastTracked.current === pageKey) return;
    lastTracked.current = pageKey;
    trackMetaEvent('PageView', {}, newMetaEventId('page_view'));
  }, [location.pathname, location.search]);

  return null;
}
