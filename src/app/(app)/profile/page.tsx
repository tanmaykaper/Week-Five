import type { Metadata } from "next";
import { ProfileScreen } from "./ProfileScreen";

export const metadata: Metadata = { title: "You" };

export default function ProfilePage() {
  return <ProfileScreen />;
}
