import type { ReactNode } from "react";

type Tone = "cyan" | "magenta" | "green" | "red" | "muted";

const tones: Record<Tone, string> = {
  cyan: "chip",
  magenta: "chip chip-magenta",
  green: "chip chip-green",
  red: "chip chip-red",
  muted: "chip chip-muted",
};

export function Chip({
  tone = "cyan",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={`${tones[tone]} ${className}`}>{children}</span>;
}
