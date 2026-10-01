import { clampCarouselItems, getHeroImageSources, getHomeSeoTexts, resolveHeroImageUrl } from '../home';

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

  describe('clampCarouselItems', () => {
    it('should keep whole numbers from 1 to 50', () => {
      expect(clampCarouselItems(12)).toBe(12);
      expect(clampCarouselItems('7.8')).toBe(7);
    });

    it('should limit larger numbers to 50 and use 50 for missing or invalid values', () => {
      expect(clampCarouselItems(80)).toBe(50);
      expect(clampCarouselItems(undefined)).toBe(50);
      expect(clampCarouselItems(0)).toBe(50);
      expect(clampCarouselItems('abc')).toBe(50);
    });
  });

  describe('getHomeSeoTexts', () => {
    it('should return the English title and description', () => {
      expect(getHomeSeoTexts('en')).toEqual({
        title: 'Heat resistant glass from Jena',
        description: expect.stringContaining('Heat resistant borosilicate glass made in Germany'),
      });
    });

    it('should return nothing for languages that keep the editor defaults', () => {
      expect(getHomeSeoTexts('de')).toBeUndefined();
      expect(getHomeSeoTexts('toString')).toBeUndefined();
    });
  });
});
