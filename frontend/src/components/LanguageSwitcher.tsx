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
    <select
      value={i18n.language}
      onChange={(e) => loadLanguage(e.target.value)}
      className="bg-brand-700 text-white text-xs rounded px-2 py-1 border border-brand-600"
    >
      {(langsQ.data ?? [{ code: "es", name: "Espanol" }]).map((l) => (
        <option key={l.code} value={l.code}>
          {l.code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
