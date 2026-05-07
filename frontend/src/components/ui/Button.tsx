import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "magenta" | "ghost" | "danger" | "neutral";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  magenta: "btn btn-magenta",
  ghost: "btn btn-ghost",
  danger: "btn btn-danger",
  neutral: "btn",
};

export function Button({
  variant = "neutral",
  size = "md",
  loading,
  leadingIcon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${variantClass[variant]} ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      {loading ? (
        <>
          <span className="inline-block w-2 h-2 bg-current rounded-full animate-glow-pulse" />
          <span>...</span>
        </>
      ) : (
        <>
          {leadingIcon && <span className="text-current">{leadingIcon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
