import { useSettingsStore } from '../../store/settingsStore';
import type { Language } from '../../types';

const LANGS: { code: Language; label: string }[] = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Рус' },
  { code: 'en', label: 'Eng' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useSettingsStore();

  return (
    <div className="flex p-0.5 gap-0.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`px-2.5 py-1.5 rounded-[10px] text-xs font-bold tracking-wide transition-all duration-200 ${
            language === code
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
