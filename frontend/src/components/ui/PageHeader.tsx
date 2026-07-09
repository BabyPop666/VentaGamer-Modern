import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  accent?: "cyan" | "magenta";
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  accent = "cyan",
}: Props) {
  const color = accent === "cyan" ? "text-neon-cyan" : "text-neon-magenta";
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-line">
      <div>
        {eyebrow && (
          <div
            className={`flex items-center gap-2 font-mono text-[0.65rem] tracking-widest2 uppercase ${color}`}
          >
            <span
              className={`w-6 h-px ${
                accent === "cyan" ? "bg-neon-cyan" : "bg-neon-magenta"
              }`}
            />
            {eyebrow}
          </div>
        )}
        <h1 className="h-display text-3xl md:text-4xl mt-1">{title}</h1>
        {subtitle && (
          <p className="text-fg-muted text-sm mt-1 font-medium">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
