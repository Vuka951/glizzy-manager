// The browser scripts find buttons and headings by their Serbian text, so a
// page gets the locale cookie before its first load. Pages in separate
// browser contexts each need their own call. The first-visit dialog is marked
// as seen the same way (lib/utils/onboarding.ts reads this key), so a fresh
// profile lands on the page itself
export async function setSerbianLocale(page, base = 'http://localhost:3000') {
  await page.browserContext().setCookie({
    name: 'locale',
    value: 'sr',
    domain: new URL(base).hostname,
    path: '/',
  });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('glizzy-onboarding-done', '1');
  });
}
