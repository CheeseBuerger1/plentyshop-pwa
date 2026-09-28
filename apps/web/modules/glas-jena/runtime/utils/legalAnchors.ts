/** Box of the legal texts from the plentymarkets system (see the legal pages and glas-jena.css). */
export const LEGAL_TEXT_SELECTOR = 'main > .no-preflight';

/**
 * Element a table of contents link in a legal text points to (`#8` → the element with `id` or `name` "8").
 * The AGB mark their paragraphs with `<h1 name="8">`, which browsers do not jump to on their own.
 */
export const findAnchorTarget = (root: Element, href: string) => {
  const name = decodeURIComponent(href.replace(/^#/, ''));
  if (!name) {
    return null;
  }
  return [...root.querySelectorAll('[id], [name]')].find(
    (element) => element.id === name || element.getAttribute('name') === name,
  );
};

/**
 * Jump links in the legal texts, like the LTS shop's script (which only worked from 992 px): a click on a link to
 * `#…` scrolls to its target, on all widths. `scroll-padding-top` in glas-jena.css keeps it clear of the sticky
 * header. Smooth unless the visitor asks for reduced motion; the focus moves to the target, so keyboard and
 * screen reader users continue reading there. The URL stays unchanged, like in the LTS shop, so the router does
 * not see the jump. Clicks with a modifier key or on other links keep their default behaviour.
 */
export const handleLegalAnchorClick = (event: MouseEvent) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
  const root = link?.closest(LEGAL_TEXT_SELECTOR);
  if (!link || !root) {
    return;
  }

  const target = findAnchorTarget(root, link.getAttribute('href') ?? '');
  if (!(target instanceof HTMLElement)) {
    return;
  }

  event.preventDefault();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
};
