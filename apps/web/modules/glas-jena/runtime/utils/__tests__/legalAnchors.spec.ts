import { findAnchorTarget, handleLegalAnchorClick } from '../legalAnchors';

/* Like the AGB from the plentymarkets system: table of contents with `#n` links, paragraphs as `<h1 name="n">` */
const LEGAL_PAGE = `
  <main>
    <div class="w-full p-5 no-preflight">
      <p class="my-agb"><a href="#1">§ 1 GELTUNGSBEREICH</a><br><a href="#2">§ 2 VERTRAGSSCHLUSS</a><a href="#99">§ 99</a></p>
      <h1 name="1">§ 1 Geltungsbereich</h1>
      <h1 name="2">§ 2 Vertragsschluss</h1>
    </div>
  </main>
  <a href="#2" data-testid="outside-link">Elsewhere</a>`;

const click = (element: Element, init: MouseEventInit = {}) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  element.dispatchEvent(event);
  return event;
};

describe('legalAnchors', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = LEGAL_PAGE;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    document.addEventListener('click', handleLegalAnchorClick);
  });

  afterEach(() => {
    document.removeEventListener('click', handleLegalAnchorClick);
    scrollIntoView.mockReset();
    document.body.innerHTML = '';
  });

  const getLink = (href: string) => document.querySelector(`.my-agb a[href="${href}"]`)!;
  const getParagraph = (name: string) => document.querySelector(`[name="${name}"]`) as HTMLElement;

  it('should find the paragraph heading by its name attribute', () => {
    const root = document.querySelector('.no-preflight')!;

    expect(findAnchorTarget(root, '#2')).toBe(getParagraph('2'));
    expect(findAnchorTarget(root, '#99')).toBeUndefined();
    expect(findAnchorTarget(root, '#')).toBeNull();
  });

  it('should scroll to the paragraph and move the focus there', () => {
    const event = click(getLink('#2'));

    expect(event.defaultPrevented).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(getParagraph('2'));
    expect(document.activeElement).toBe(getParagraph('2'));
    expect(getParagraph('2').getAttribute('tabindex')).toBe('-1');
  });

  it('should jump without animation when the visitor prefers reduced motion', () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    click(getLink('#1'));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    window.matchMedia = matchMedia;
  });

  it('should leave links without a target, outside the legal texts and with a modifier key alone', () => {
    expect(click(getLink('#99')).defaultPrevented).toBe(false);
    expect(click(document.querySelector('[data-testid="outside-link"]')!).defaultPrevented).toBe(false);
    expect(click(getLink('#1'), { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
