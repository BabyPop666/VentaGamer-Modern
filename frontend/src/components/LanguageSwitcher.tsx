import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchLanguages, loadLanguage } from "../lib/i18n";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const langsQ = useQuery({
    queryKey: ["i18n-languages"],
    queryFn: fetchLanguages,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="hidden sm:flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest2 text-fg-muted">
      <span className="text-neon-cyan">LANG</span>
      <select
        value={i18n.language}
        onChange={(e) => loadLanguage(e.target.value)}
        className="bg-transparent border border-line hover:border-neon-cyan text-fg px-1.5 py-0.5 text-[0.65rem] font-mono tracking-widest2 cursor-pointer focus:outline-none focus:border-neon-cyan transition-colors"
      >
        {(langsQ.data ?? [{ code: "es", name: "Español" }]).map((l) => (
          <option key={l.code} value={l.code} className="bg-ink-900">
            {l.code.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
