"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }
  return (
    <Button variant="outline" className="w-full" onClick={logout}>
      Log out
    </Button>
  );
}
