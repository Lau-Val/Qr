import { GuestFlow } from "../../GuestFlow";

export const metadata = {
  title: "Kies je prijs — Salon",
  description: "Draai het rad en unlock je salon-deal",
};

export default function GastKapperUnlockPage() {
  return <GuestFlow initialStep="unlock" templateId="kapper" />;
}
