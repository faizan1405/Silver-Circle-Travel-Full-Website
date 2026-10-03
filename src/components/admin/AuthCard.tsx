import type { ReactNode } from "react";
import logo from "@/assets/logo.png.asset.json";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img src={logo.url} alt="Silver Circle Travel" width={160} height={160} className="h-20 w-auto object-contain" />
        </div>
        <div className="rounded-[1.75rem] border border-border bg-card p-7 shadow-lift sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Admin</p>
          <h1 className="mt-2 text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
