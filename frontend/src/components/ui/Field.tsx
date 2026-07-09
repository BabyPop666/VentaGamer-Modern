import type { ReactNode } from "react";

type Props = {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

export function Field({ label, required, hint, error, children }: Props) {
  return (
    <div>
      <label className="label flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-neon-magenta ml-1">*</span>}
        </span>
        {hint && (
          <span className="text-fg-dim text-[0.6rem] tracking-normal normal-case">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs font-mono text-neon-red">&gt; {error}</p>
      )}
    </div>
  );
}
