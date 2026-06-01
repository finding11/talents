export function TestModeBanner() {
  const isTest =
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ||
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_APP_URL?.includes("staging.");

  if (!isTest) return null;

  return (
    <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-navy-900">
      TEST MODE — Stripe payments are in test mode
    </div>
  );
}
