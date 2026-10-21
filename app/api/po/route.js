import { createOrder } from '@/lib/po-server';

export async function POST(request) {
  let body = null;
  try {
    body = await request.json();
  } catch {}
  const ip = (request.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const { status, body: out } = await createOrder(body, ip);
  return Response.json(out, { status, headers: { 'Cache-Control': 'no-store' } });
}
