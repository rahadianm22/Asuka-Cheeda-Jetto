// Server-only switch for the whole merch feature. Off unless MERCH_ENABLED=true, so a deployment without the
// variable shows no teaser on the homepage and answers 404 on /merch and /api/po.
export const merchEnabled = () => process.env.MERCH_ENABLED === 'true';
