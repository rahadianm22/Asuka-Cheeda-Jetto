'use client';

import { useEffect, useState } from 'react';

// Matches a media query after mount (false on the server and on the first client paint, so hydration agrees).
export default function useMedia(query) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}
