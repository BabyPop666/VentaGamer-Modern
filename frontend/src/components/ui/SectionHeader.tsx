import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  align?: "left" | "center";
  accent?: "cyan" | "magenta";
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  accent = "cyan",
}: Props) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-widest2 uppercase ${
            accent === "cyan" ? "text-neon-cyan" : "text-neon-magenta"
          }`}
        >
          <span
            className={`w-6 h-px ${
              accent === "cyan" ? "bg-neon-cyan" : "bg-neon-magenta"
            }`}
          />
          {eyebrow}
        </div>
      )}
      <h2 className="h-display text-2xl md:text-3xl mt-1">{title}</h2>
      {subtitle && (
        <p className="text-fg-muted text-sm mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
