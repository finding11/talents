import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await getSession();
  if (session?.user) redirect("/en/dashboard");

  const { role } = await searchParams;
  const defaultRole = role === "recruiter" ? "RECRUITER" : "TALENT";

  return <SignupForm defaultRole={defaultRole} />;
}
