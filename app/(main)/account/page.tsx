"use client";

import { useAuthStore } from "@/app/stores/auth";
import { AccountView } from "@/components/accounts/account-view";

export default function AccountProfilePage() {
  const user = useAuthStore((s) => s.user);
  return <AccountView user={user} />;
}
