import 'server-only';
import { type Locale, hasLocale, locales } from '@/lib/i18n';

const dictionaries = {
  en: () => import('../../lang/en.json').then((m) => m.default),
} as const;

export type { Locale };
export { hasLocale, locales };

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
