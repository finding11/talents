/** Read env vars supporting both standard names and GitHub/Cloudflare secret names */

export function env(key: string, alt?: string): string | undefined {
  return process.env[key] ?? (alt ? process.env[alt] : undefined);
}

export const appEnv = {
  databaseUrl: env("DATABASE_URL")!,
  nextAuthUrl: env("NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  nextAuthSecret: env("NEXTAUTH_SECRET")!,
  stripePublicKey: env("STRIPE_PUBLIC_KEY", "STRIPEPUBLICKEY"),
  stripeSecretKey: env("STRIPE_SECRET_KEY", "STRIPESECRETKEY"),
  stripeWebhookSecret: env("STRIPE_WEBHOOK_SECRET", "STRIPEWEBHOOKSECRET"),
  turnstileSiteKey: env("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILESITEKEY"),
  turnstileSecretKey: env("TURNSTILE_SECRET_KEY", "TURNSTILESECRETKEY"),
  supportEmail: env("SUPPORT_EMAIL", "SUPPORTEMAIL") ?? "talents@finding11.com",
  refundDays: parseInt(env("REFUND_DAYS", "REFUNDDAYS") ?? "3", 10),
};
