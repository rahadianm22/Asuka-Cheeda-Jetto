import { createOrder } from '@/lib/po-server';
import { merchEnabled } from '@/lib/merch-flag';

export async function POST(request) {
  if (!merchEnabled()) return new Response(null, { status: 404 });
  let body = null;
  try {
    body = await request.json();
  } catch {}
  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const { status, body: out } = await createOrder(body, ip);
  return Response.json(out, { status, headers: { 'Cache-Control': 'no-store' } });
}
