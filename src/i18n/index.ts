import uz from './uz';
import ru from './ru';
import en from './en';
import type { Language } from '../types';

const translations = { uz, ru, en } as const;

export type TranslationKey = keyof typeof uz;

export function t(lang: Language, key: TranslationKey): string {
  return (translations[lang] as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
}

export { uz, ru, en };
