import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/prisma";
import { getStripe, assertStripeTestModeInStaging } from "@/lib/stripe";
import { getUnlockPriceCents } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    assertStripeTestModeInStaging();
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Recruiter account required" }, { status: 403 });
    }

    const { talentId, talentSlug } = await req.json();
    const prisma = getDb();
    const talent = await prisma.talentProfile.findFirst({
      where: { id: talentId, slug: talentSlug, published: true },
      include: { privateContact: true },
    });
    if (!talent) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    const existing = await prisma.accessGrant.findUnique({
      where: {
        recruiterId_talentId: {
          recruiterId: session.user.id,
          talentId: talent.id,
        },
      },
    });
    if (existing && !existing.revoked) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      return NextResponse.json({
        url: `${base}/en/talent/${talent.slug}?unlocked=1`,
      });
    }

    const priceCents = await getUnlockPriceCents(talent);
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: priceCents,
            product_data: {
              name: `Contact unlock — ${talent.displayName}`,
              description: `Finding11 contact access for ${talent.displayName}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        recruiterId: session.user.id,
        talentId: talent.id,
      },
      success_url: `${baseUrl}/en/talent/${talent.slug}?unlocked=1`,
      cancel_url: `${baseUrl}/en/talent/${talent.slug}`,
    });

    await prisma.payment.create({
      data: {
        recruiterId: session.user.id,
        talentId: talent.id,
        amountCents: priceCents,
        currency: "eur",
        stripeSessionId: checkoutSession.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
