"use client";
import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LangToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "id" ? "en" : "id")}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-white bg-dark-700 border border-dark-500 rounded-md hover:border-accent-primary/30 transition-all"
      title={`Switch to ${t("lang.switch")}`}
    >
      <Globe size={12} />
      <span className="font-medium">{locale === "id" ? "🇮🇩 ID" : "🇺🇸 EN"}</span>
    </button>
  );
}
