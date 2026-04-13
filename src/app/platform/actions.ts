"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlatformAdminUser } from "@/lib/auth/platform-admin";
import { parseVenueType } from "@/lib/venue-type";
import { createServerSupabase } from "@/utils/supabase/server";

export type CreateBarResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createBarWithOwner(
  formData: FormData,
): Promise<CreateBarResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isPlatformAdminUser(user))) {
    return { ok: false, error: "Geen toegang tot platform-beheer." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const ownerEmail = String(formData.get("ownerEmail") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const venueType = parseVenueType(String(formData.get("venueType") ?? "horeca"));

  if (!name || !slug || !ownerEmail || !password) {
    return { ok: false, error: "Vul alle velden in." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Wachtwoord minimaal 8 tekens." };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      ok: false,
      error: "Slug: alleen kleine letters, cijfers en streepjes (bijv. cafe-nova).",
    };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("bars")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "Deze slug bestaat al." };
  }

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: ownerEmail,
    password,
    email_confirm: true,
  });
  if (authErr || !authData.user) {
    return {
      ok: false,
      error: authErr?.message ?? "Account aanmaken mislukt (bestaat het e-mailadres al?).",
    };
  }

  const { data: bar, error: barErr } = await admin
    .from("bars")
    .insert({ slug, name, settings: {}, venue_type: venueType })
    .select("id")
    .single();

  if (barErr || !bar) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { ok: false, error: barErr?.message ?? "Zaak aanmaken mislukt." };
  }

  const { error: memErr } = await admin.from("bar_members").insert({
    user_id: authData.user.id,
    bar_id: bar.id,
    role: "owner",
  });

  if (memErr) {
    await admin.from("bars").delete().eq("id", bar.id);
    await admin.auth.admin.deleteUser(authData.user.id);
    return { ok: false, error: memErr.message };
  }

  revalidatePath("/admin");
  revalidatePath("/platform");
  return { ok: true };
}
