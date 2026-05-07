import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "cyan" | "magenta" | "green" | "red";
};

const accents = {
  cyan: "text-neon-cyan",
  magenta: "text-neon-magenta",
  green: "text-neon-green",
  red: "text-neon-red",
};

export function StatTile({ label, value, hint, tone = "cyan" }: Props) {
  return (
    <div className="panel corners px-4 py-3 relative overflow-hidden">
      <div
        className={`label !mb-1 ${
          tone === "magenta" ? "text-neon-magenta" : "text-neon-cyan"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-display font-bold text-2xl md:text-3xl ${accents[tone]}`}
        style={{
          textShadow:
            tone === "cyan"
              ? "0 0 14px rgba(0,240,255,0.55)"
              : tone === "magenta"
              ? "0 0 14px rgba(255,45,149,0.55)"
              : tone === "green"
              ? "0 0 14px rgba(57,255,122,0.55)"
              : "0 0 14px rgba(255,59,107,0.55)",
        }}
      >
        {value}
      </div>
      {hint && (
        <div className="text-fg-muted text-xs font-mono mt-1">{hint}</div>
      )}
    </div>
  );
}
