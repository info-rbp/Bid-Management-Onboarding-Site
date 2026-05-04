import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(firebaseAdminConfig as any),
  });
}

const db = getFirestore();

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId) {
        await db.collection('users').doc(userId).update({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: 'active',
          updatedAt: new Date().toISOString(),
        });
      }
      break;
    
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object as Stripe.Subscription;
      const userQuery = await db.collection('users')
        .where('stripeSubscriptionId', '==', subscriptionDeleted.id)
        .limit(1)
        .get();
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        await userDoc.ref.update({
          subscriptionStatus: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
      }
      break;

    case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        const userQueryUpdated = await db.collection('users')
          .where('stripeSubscriptionId', '==', subscriptionUpdated.id)
          .limit(1)
          .get();
        
        if (!userQueryUpdated.empty) {
          const userDoc = userQueryUpdated.docs[0];
          await userDoc.ref.update({
            subscriptionStatus: subscriptionUpdated.status === 'active' ? 'active' : 'past_due',
            updatedAt: new Date().toISOString(),
          });
        }
        break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
