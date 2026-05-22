import { BottomNav, SideNav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-10">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
