import { getHeroImageSources, resolveHeroImageUrl } from '../home';

describe('home utils', () => {
  describe('resolveHeroImageUrl', () => {
    it('should return the image set for the size', () => {
      expect(resolveHeroImageUrl({ mobile: 'm.jpg', desktop: 'd.jpg' }, 'mobile')).toBe('m.jpg');
    });

    it('should fall back to the next larger size', () => {
      expect(resolveHeroImageUrl({ desktop: 'd.jpg', wideScreen: 'w.jpg' }, 'mobile')).toBe('d.jpg');
    });

    it('should fall back to a smaller size when no larger one is set', () => {
      expect(resolveHeroImageUrl({ tablet: 't.jpg' }, 'wideScreen')).toBe('t.jpg');
    });

    it('should ignore empty entries and return an empty string without any image', () => {
      expect(resolveHeroImageUrl({ wideScreen: ' ', desktop: '' }, 'desktop')).toBe('');
    });
  });

  describe('getHeroImageSources', () => {
    it('should list one source per differing size, smallest window first', () => {
      const sources = getHeroImageSources({ mobile: 'm.jpg', tablet: 't.jpg', desktop: 'd.jpg', wideScreen: 'w.jpg' });

      expect(sources).toEqual([
        { maxWidth: 767, url: 'm.jpg' },
        { maxWidth: 1023, url: 't.jpg' },
        { maxWidth: 1439, url: 'd.jpg' },
      ]);
    });

    it('should leave out sizes that repeat the image of the next larger size', () => {
      const sources = getHeroImageSources({
        mobile: 'small.jpg',
        tablet: 'large.jpg',
        desktop: 'large.jpg',
        wideScreen: 'large.jpg',
      });

      expect(sources).toEqual([{ maxWidth: 767, url: 'small.jpg' }]);
    });

    it('should return no sources for a single image', () => {
      expect(getHeroImageSources({ wideScreen: 'w.jpg' })).toEqual([]);
    });
  });
});
