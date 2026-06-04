import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignupForm } from "@/components/signup-form";

export default async function RecruiterSignupPage() {
  const session = await getSession();
  if (session?.user) redirect("/en/dashboard");

  return <SignupForm defaultRole="RECRUITER" />;
}
