import { Eyebrow } from "@/components/ui/eyebrow";

export function AuthShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-10 lg:py-16">
      <div className="w-full max-w-[480px] rounded-[28px] bg-card p-6 sm:p-10">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 text-h2">{title}</h1>
        {subtitle && <p className="mt-2 text-body text-ink-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
