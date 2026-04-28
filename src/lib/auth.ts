import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function isAllowedAdminEmail(email: string | undefined) {
  const configured = process.env.ADMIN_EMAILS;

  if (!configured) {
    return true;
  }

  const allowlist = configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0) {
    return true;
  }

  return !!email && allowlist.includes(email.toLowerCase());
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();

  if (!isAllowedAdminEmail(user.email)) {
    redirect("/");
  }

  return user;
}
