import {
  ACTIVE_LOCALE,
  dictionaryFor,
  type Locale,
} from '@/data/games/locale';

export function fmt(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match,
  );
}

// Percent swings read with their sign, so a discount and a markup never look alike
export function signedPct(pct: number): string {
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

export function signedNumber(n: number): string {
  return `${n > 0 ? '+' : ''}${n}`;
}

// A counted phrase as the locale files store it. Both languages carry all
// three keys so their key trees match: Serbian uses each one (1 poen, 2 poena,
// 5 poena), English repeats its plural under `few` and `other`
export type PluralForms = { one: string; few: string; other: string };

export function isPluralForms(value: unknown): value is PluralForms {
  if (value === null || typeof value !== 'object') return false;
  const forms = value as Record<string, unknown>;
  return (
    Object.keys(forms).length === 3 &&
    typeof forms.one === 'string' &&
    typeof forms.few === 'string' &&
    typeof forms.other === 'string'
  );
}

const pluralRules = new Map<string, Intl.PluralRules>();

function rulesFor(locale: Locale, type: Intl.PluralRuleType): Intl.PluralRules {
  const cacheKey = `${locale}:${type}`;
  let rules = pluralRules.get(cacheKey);
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type });
    pluralRules.set(cacheKey, rules);
  }
  return rules;
}

// Picks the form the language's own plural rule asks for, then fills it like
// fmt. The count itself goes in `params` under whatever name the template uses
export function plural(
  forms: PluralForms,
  count: number,
  params: Record<string, string | number> = {},
  locale: Locale = ACTIVE_LOCALE,
): string {
  const category = rulesFor(locale, 'cardinal').select(Math.abs(count));
  return fmt(
    category === 'one' ? forms.one : category === 'few' ? forms.few : forms.other,
    params,
  );
}

// A position as the language writes it: "3." in Serbian, "3rd" in English.
// Templates take the result whole, so none of them carries its own dot or
// suffix
export function ordinal(n: number, locale: Locale = ACTIVE_LOCALE): string {
  const forms: Partial<Record<Intl.LDMLPluralRule, string>> & {
    other: string;
  } = dictionaryFor(locale).shared.ordinal;
  const category = rulesFor(locale, 'ordinal').select(n);
  return fmt(forms[category] ?? forms.other, { n });
}
