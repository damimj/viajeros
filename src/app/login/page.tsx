import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login" };

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">{t("login")}</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
