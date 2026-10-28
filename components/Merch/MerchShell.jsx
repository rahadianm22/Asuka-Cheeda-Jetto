'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/components/LanguageProvider';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import { EVENT } from '@/lib/po-config';
import { COPY } from '@/lib/merch-copy';
import MerchApp from './MerchApp';
import ClosedView from './ClosedView';

const ORDER_KEY = 'jetto-po-order';

// Picks the page: the order form while the PO is open, the "PO ditutup" page after the deadline. A buyer who just
// placed an order keeps their success page (it is kept for the tab), and a page left open past the deadline switches
// over by itself when the timer runs out.
export default function MerchShell({ products, status, closed }) {
  const { t } = useLang();
  const [timeUp, setTimeUp] = useState(false);
  const [hasOrder, setHasOrder] = useState(false);

  useEffect(() => {
    try {
      setHasOrder(!!window.sessionStorage.getItem(ORDER_KEY));
    } catch {}
  }, []);

  const showClosed = (closed || timeUp) && !hasOrder;
  const ticker = showClosed
    ? [t('mcTkDone'), t('mcTkThanks'), `${t('mcTkSee')} ${EVENT.booth}`, t('mcTkWoof')]
    : COPY.ticker;

  return (
    <>
      <Ticker items={ticker} />
      <div className="wrap">
        <main className="merch">
          {showClosed ? (
            <ClosedView products={products} />
          ) : (
            <MerchApp products={products} status={status} onTimeUp={() => setTimeUp(true)} />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
