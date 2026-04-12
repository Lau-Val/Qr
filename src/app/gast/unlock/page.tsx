import { GuestFlow } from "../GuestFlow";

export const metadata = {
  title: "Kies je deal — BarBoost",
  description: "Draai het rad en unlock je deal",
};

export default function GastUnlockPage() {
  return <GuestFlow initialStep="unlock" />;
}
