import { redirect } from "next/navigation";

/** Nederlandse URL; zelfde scherm als /login */
export default function InloggenRedirectPage() {
  redirect("/login");
}
