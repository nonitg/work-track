"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function LoginForm({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    if (!res.ok) {
      setError("Wrong passcode");
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">work-track</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter passcode to continue</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input
            type="password"
            inputMode="text"
            autoFocus
            autoComplete="current-password"
            placeholder="passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading || !passcode} className="w-full">
            {loading ? "..." : "Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
