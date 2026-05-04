import { NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { userId, email, priceId } = await req.json();

    if (!userId || !email || !priceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await createStripeCheckoutSession(userId, email, priceId);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
