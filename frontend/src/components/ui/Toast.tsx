type Tone = "success" | "error";

export function Toast({
  tone,
  message,
}: {
  tone: Tone;
  message: string;
}) {
  const isOk = tone === "success";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 panel corners px-4 py-3 min-w-[280px] flex items-center gap-3 animate-rise ${
        isOk ? "panel-glow" : ""
      }`}
      style={{
        borderColor: isOk
          ? "rgba(57,255,122,0.5)"
          : "rgba(255,59,107,0.55)",
        boxShadow: isOk
          ? "0 0 28px -4px rgba(57,255,122,0.55)"
          : "0 0 28px -4px rgba(255,59,107,0.55)",
      }}
    >
      <span
        className={`font-mono text-xs uppercase tracking-widest2 ${
          isOk ? "text-neon-green" : "text-neon-red"
        }`}
      >
        {isOk ? "[OK]" : "[ERR]"}
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
