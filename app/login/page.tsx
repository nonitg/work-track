import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const nextRaw = sp.next;
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : "/";
  return <LoginForm next={next} />;
}
