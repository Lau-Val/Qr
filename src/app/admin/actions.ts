"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/bar-session";
import { isPlatformAdminUser } from "@/lib/auth/platform-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreatePlatformAdminResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createPlatformAdminUser(
  formData: FormData,
): Promise<CreatePlatformAdminResult> {
  const user = await getSessionUser();
  if (!user || !(await isPlatformAdminUser(user))) {
    return { ok: false, error: "Geen toegang tot platformbeheer." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, error: "Vul e-mail en wachtwoord in." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Wachtwoord minimaal 8 tekens." };
  }

  const admin = createAdminClient();
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr || !authData.user) {
    return {
      ok: false,
      error: authErr?.message ?? "Account aanmaken mislukt (bestaat het e-mailadres al?).",
    };
  }

  const { error: insErr } = await admin.from("platform_admins").insert({
    user_id: authData.user.id,
    created_by: user.id,
  });
  if (insErr) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { ok: false, error: insErr.message };
  }

  revalidatePath("/admin");
  return { ok: true };
}
