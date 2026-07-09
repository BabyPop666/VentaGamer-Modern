import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="panel corners py-14 px-6 text-center relative">
      <div className="text-neon-cyan opacity-70 mb-4 flex justify-center text-4xl">
        {icon ?? "◌"}
      </div>
      <h3 className="h-display text-xl mb-2">{title}</h3>
      {description && (
        <p className="text-fg-muted text-sm max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
