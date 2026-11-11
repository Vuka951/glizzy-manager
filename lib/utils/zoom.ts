// The CSS zoom an element is drawn at, its own times every ancestor's.
// Client rects come back zoomed while lengths set on the element get
// zoomed again, so a rect has to be divided by this before it is reused
export function effectiveZoom(el: Element): number {
  if (typeof el.currentCSSZoom === 'number') return el.currentCSSZoom;
  const width = el instanceof HTMLElement ? el.offsetWidth : 0;
  return width > 0 ? el.getBoundingClientRect().width / width : 1;
}
