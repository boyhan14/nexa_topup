import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("nexa-shell text-white", className)}>{children}</div>;
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 lg:px-8", className)}>{children}</div>;
}

export function PremiumPanel({
  children,
  className,
  as: Component = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "article" | "div" | "aside";
}) {
  return <Component className={cn("premium-card rounded-2xl p-5 sm:p-6", className)}>{children}</Component>;
}

export function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "blue" | "neutral" | "green" | "amber" | "rose" }) {
  const toneClass = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    blue: "border-blue-300/25 bg-blue-400/10 text-blue-100",
    neutral: "border-white/15 bg-white/8 text-slate-200",
    green: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    rose: "border-rose-300/25 bg-rose-400/10 text-rose-100",
  }[tone];

  return <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold", toneClass)}>{children}</span>;
}

export function CTA({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link href={href} className={cn("button", variant === "secondary" && "button-secondary")}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}

export function LoadingSpinner({ label = "Memuat" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="animate-spin" size={17} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-2xl bg-white/5", className)} aria-hidden="true" />;
}

export function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Progress checkout">
      {steps.map((step, index) => {
        const active = index <= current;
        return (
          <li
            key={step}
            className={cn(
              "checkout-step flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition",
              active ? "checkout-step-active border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.035] text-slate-500",
            )}
          >
            {index < current ? <CheckCircle2 size={15} aria-hidden="true" /> : <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[11px]">{index + 1}</span>}
            <span className="truncate">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
