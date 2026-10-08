import { GAMES_UI } from '@/data/games/locale';
import {
  fmt,
  isPluralForms,
  ordinal,
  plural,
  type PluralForms,
} from '@/lib/utils/format';
import {
  characterName,
  investmentName,
  sponsorCoalitionName,
  sponsorName,
  trainingName,
} from '@/lib/utils/localeNames';
import type {
  Message,
  MessageParams,
  MessageRefKind,
  MessageRefs,
} from '@/lib/utils/message';

const splitIds = (value: string) => value.split(',').filter(Boolean);

const REF_RENDERERS: Record<MessageRefKind, (value: string) => string> = {
  character: characterName,
  sponsor: sponsorName,
  sponsorList: (value) => splitIds(value).map(sponsorName).join(', '),
  sponsorCoalition: (value) => sponsorCoalitionName(splitIds(value)),
  training: trainingName,
  investment: investmentName,
  ordinal: (value) => ordinal(Number(value)),
  count: (value) => value,
};

export type MessageTemplate = string | PluralForms;

// Every parameter a ref points at is swapped for its name in the reader's
// language; numbers and free text pass through
export function resolveMessageParams(
  params: MessageParams,
  refs: MessageRefs | undefined,
): MessageParams {
  if (!refs) return params;
  const resolved: MessageParams = { ...params };
  Object.entries(refs).forEach(([name, kind]) => {
    if (name in params) resolved[name] = REF_RENDERERS[kind](String(params[name]));
  });
  return resolved;
}

export function localeTemplate(key: string): MessageTemplate | null {
  let node: unknown = GAMES_UI;
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return null;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' || isPluralForms(node) ? node : null;
}

// Fills a template from raw parameters. A counted template takes its form
// from the parameter the refs mark as `count`; a message stored without one
// reads in the plural
export function fillMessage(
  template: MessageTemplate,
  params: MessageParams,
  refs?: MessageRefs,
): string {
  const resolved = resolveMessageParams(params, refs);
  if (typeof template === 'string') return fmt(template, resolved);
  const countName = Object.keys(refs ?? {}).find(
    (name) => refs?.[name] === 'count' && name in params,
  );
  return countName
    ? plural(template, Number(params[countName]), resolved)
    : fmt(template.other, resolved);
}

// The one place a stored or received message becomes a sentence
export function renderMessage({ key, params, refs }: Message): string {
  return fillMessage(localeTemplate(key) ?? key, params, refs);
}
