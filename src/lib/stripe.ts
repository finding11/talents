import Stripe from "stripe";
import { appEnv } from "./env";

export function getStripe(): Stripe {
  const key = appEnv.stripeSecretKey;
  if (!key) throw new Error("STRIPE_SECRET_KEY / STRIPESECRETKEY is not set");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export function isStripeLiveMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return key.startsWith("sk_live_");
}

export function assertStripeTestModeInStaging() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (url.includes("staging.") && isStripeLiveMode()) {
    throw new Error("Live Stripe keys are not allowed on staging");
  }
}
