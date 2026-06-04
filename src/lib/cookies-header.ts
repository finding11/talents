import { cookies, headers } from "next/headers";

/** Build the raw Cookie header NextAuth expects (RequestCookies has no useful toString()). */
export async function getRequestCookieHeader(): Promise<string> {
  const headersList = await headers();
  const fromHeader = headersList.get("cookie");
  if (fromHeader) return fromHeader;

  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}
