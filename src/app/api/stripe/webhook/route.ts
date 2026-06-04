import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getDb } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { logAudit } from "@/lib/access";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPEWEBHOOKSECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const recruiterId = session.metadata?.recruiterId;
    const talentId = session.metadata?.talentId;

    if (recruiterId && talentId) {
      const prisma = getDb();
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "PAID" },
      });

      const existingGrant = await prisma.accessGrant.findUnique({
        where: {
          recruiterId_talentId: { recruiterId, talentId },
        },
      });

      if (existingGrant) {
        await prisma.accessGrant.update({
          where: {
            recruiterId_talentId: { recruiterId, talentId },
          },
          data: { revoked: false },
        });
      } else {
        await prisma.accessGrant.create({
          data: { recruiterId, talentId },
        });
      }

      await logAudit("contact_unlocked", {
        userId: recruiterId,
        talentId,
        metadata: { sessionId: session.id },
      });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string | undefined;
    if (paymentIntentId) {
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      const match = sessions.data.find((s) => s.payment_intent === paymentIntentId);
      if (match?.metadata?.recruiterId && match.metadata.talentId) {
        const prisma = getDb();
        await prisma.payment.updateMany({
          where: { stripeSessionId: match.id },
          data: { status: "REFUNDED", refundedAt: new Date() },
        });
        await prisma.accessGrant.updateMany({
          where: {
            recruiterId: match.metadata.recruiterId,
            talentId: match.metadata.talentId,
          },
          data: { revoked: true },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
