import { redirect } from "next/navigation";

/**
 * Oude URL; beheer staat op /admin.
 */
export default function PlatformPage() {
  redirect("/admin");
}
