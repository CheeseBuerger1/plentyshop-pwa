import { getCategoryLanguagePath, getNativeLanguageName } from '../locale';

describe('getNativeLanguageName', () => {
  it('should name a language in its own language with a capital first letter', () => {
    expect(getNativeLanguageName('en')).toBe('English');
    expect(getNativeLanguageName('de')).toBe('Deutsch');
  });
});

describe('getCategoryLanguagePath', () => {
  const languageUrls = {
    'x-default': '/kueche-helfer/schuesseln',
    de: '/kueche-helfer/schuesseln',
    en: '/kitchen-helpers/bowls',
    cs: '/kuchyne/misky',
  };

  it('should find the path of a category in a language by its hreflang code', () => {
    expect(getCategoryLanguagePath(languageUrls, 'en')).toBe('/kitchen-helpers/bowls');
    expect(getCategoryLanguagePath(languageUrls, 'de')).toBe('/kueche-helfer/schuesseln');
  });

  it("should map hreflang codes that differ from the shop's language codes (cs → cz)", () => {
    expect(getCategoryLanguagePath(languageUrls, 'cz')).toBe('/kuchyne/misky');
  });

  it('should find nothing for a language without an address, and never take the x-default address', () => {
    expect(getCategoryLanguagePath(languageUrls, 'fr')).toBeUndefined();
    expect(getCategoryLanguagePath({ 'x-default': '/kueche-helfer/schuesseln' }, 'x-default')).toBeUndefined();
    expect(getCategoryLanguagePath({ 'x-default': '', en: '' }, 'en')).toBeUndefined();
    expect(getCategoryLanguagePath(undefined, 'en')).toBeUndefined();
  });
});
