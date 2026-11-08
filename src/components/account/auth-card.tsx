import { Logo } from "@/components/layout/logo";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-background p-8">
        <div className="mb-6 text-center">
          <Logo className="text-2xl" />
          <h1 className="mt-4 font-display text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
