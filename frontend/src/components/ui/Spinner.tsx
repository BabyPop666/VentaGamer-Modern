export function Spinner({ label = "LOADING" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-neon-cyan font-mono text-xs tracking-widest2 uppercase">
      <div className="relative w-4 h-4">
        <span className="absolute inset-0 border border-neon-cyan/40" />
        <span className="absolute inset-0 border-t border-neon-cyan animate-spin" />
      </div>
      <span className="animate-glow-pulse">&gt; {label}</span>
    </div>
  );
}
