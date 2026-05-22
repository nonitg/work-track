import { BottomNav, SideNav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-start">
      <SideNav />
      <main className="min-w-0 flex-1 pb-24 md:pb-12">
        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:px-10 md:pt-10">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
