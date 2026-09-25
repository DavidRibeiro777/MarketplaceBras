// src/app/login/page.tsx
import { redirect } from "next/navigation";

interface LoginRedirectProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginRedirect({ searchParams }: LoginRedirectProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const params = new URLSearchParams();

  Object.entries(resolvedParams).forEach(([key, val]) => {
    if (typeof val === "string") {
      params.set(key, val);
    } else if (Array.isArray(val) && val.length > 0) {
      params.set(key, val[0]);
    }
  });

  const query = params.toString();
  redirect(`/auth/login${query ? `?${query}` : ""}`);
}
