// Everything about the CF23 pre-order that changes between events lives here, not in components.

// Delivery to an address. Off hides the option; the form, server checks and success page stay behind this flag.
export const SHIPPING_ENABLED = true;

export const PO_OPEN_AT = '2026-10-13T00:00:00+07:00';
export const PO_CLOSE_AT = '2026-10-28T23:59:59+07:00';

export const EVENT = {
  name: 'Comic Frontier 23',
  venue: 'ICE BSD',
  booth: 'PKK AC 33-34',
  daysLabel: 'Sab 31 Okt – Min 1 Nov 2026',
  hoursLabel: '09.00 – 18.00 WIB',
  poCloseLabel: '28 Oktober 2026',
  // TODO: not confirmed with the admin yet. Placeholder is the end of the event.
  pickupDeadlineLabel: '1 November 2026, 18.00 WIB',
  calendarStart: '2026-10-31T09:00:00+07:00',
  calendarEnd: '2026-11-01T18:00:00+07:00',
};

// WhatsApp number in international format without "+", e.g. 6281234567890. Set in .env.local / Vercel.
export const ADMIN_WA = (process.env.NEXT_PUBLIC_ADMIN_WA || '').replace(/\D/g, '');

export const LIMITS = { maxLines: 30, maxQty: 99, maxNote: 500 };
export const RATE_LIMIT = { max: 5, windowMs: 60_000 };

/** @returns {'soon' | 'open' | 'closed'} */
export function getPOStatus(now = new Date()) {
  const t = now.getTime();
  if (t < new Date(PO_OPEN_AT).getTime()) return 'soon';
  if (t > new Date(PO_CLOSE_AT).getTime()) return 'closed';
  return 'open';
}
