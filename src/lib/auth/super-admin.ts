/**
 * Platform-beheerders (jij): e-mailadressen in SUPER_ADMIN_EMAILS (komma-gescheiden).
 */
export function getSuperAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.trim().toLowerCase());
}
