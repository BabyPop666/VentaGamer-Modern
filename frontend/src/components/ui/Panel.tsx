import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
  corners?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
};

const padMap = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function Panel({
  glow,
  corners,
  padding = "md",
  className = "",
  children,
  ...rest
}: PanelProps) {
  return (
    <div
      {...rest}
      className={`panel ${glow ? "panel-glow" : ""} ${corners ? "corners" : ""} ${padMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
