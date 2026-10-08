// A sentence that is stored or sent travels as a key into the locale tree
// plus raw parameters, and is rendered by the screen that shows it, in that
// screen's language. Nothing here reads the locale, so the server can build
// messages without ever producing text

// How the renderer turns a raw parameter into words: a roster slug, a
// sponsor id, a comma separated list of sponsor ids, a training or an
// investment id, a position that prints as an ordinal. `count` names the
// number that picks the form when the template is a { one, few, other }
// group. A parameter without a ref prints as it is
export const MESSAGE_REF_KINDS = [
  'character',
  'sponsor',
  'sponsorList',
  'sponsorCoalition',
  'training',
  'investment',
  'ordinal',
  'count',
] as const;

export type MessageRefKind = (typeof MESSAGE_REF_KINDS)[number];

export type MessageParams = Record<string, string | number>;

export type MessageRefs = Record<string, MessageRefKind>;

export type Message = {
  // Dot path into the locale tree, for example career.toast.guard
  key: string;
  params: MessageParams;
  refs?: MessageRefs;
};

export function message(
  key: string,
  params: MessageParams = {},
  refs?: MessageRefs,
): Message {
  return refs ? { key, params, refs } : { key, params };
}
