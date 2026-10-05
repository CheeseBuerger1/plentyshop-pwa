import {
  clampCarouselItems,
  clampHeroSliderInterval,
  getHeroSlideImage,
  getHeroSlides,
  getHeroSliderImageUrls,
  getHomeSeoTexts,
  pickHeroStartIndex,
} from '../home';

/* Fixed results of Math.random for the start image */
const FIRST = () => 0;
const MIDDLE = () => 0.5;
const LAST = () => 0.99;

describe('home utils', () => {
  describe('pickHeroStartIndex', () => {
    it('should pick one of the images that have a picture', () => {
      const images = [undefined, 'b', 'c', undefined];

      expect(pickHeroStartIndex(images, FIRST)).toBe(1);
      expect(pickHeroStartIndex(images, LAST)).toBe(2);
    });

    it('should return 0 without any picture', () => {
      expect(pickHeroStartIndex([undefined], MIDDLE)).toBe(0);
      expect(pickHeroStartIndex([], MIDDLE)).toBe(0);
    });
  });

  describe('getHeroSlides', () => {
    it('should return the image sequence', () => {
      const slides = [{ large: 'a.jpg' }, { large: 'b.jpg' }];

      expect(getHeroSlides({ slides, image: { wideScreen: 'old.jpg' } })).toBe(slides);
    });

    it('should read the single image of the first block version as one slide', () => {
      const image = { wideScreen: 'w.jpg', desktop: 'w.jpg', tablet: 'w.jpg', mobile: 'm.jpg', alt: 'Tea pot' };

      expect(getHeroSlides({ image })).toEqual([{ large: 'w.jpg', medium: '', small: 'm.jpg', alt: 'Tea pot' }]);
    });

    it('should return no slides without images', () => {
      expect(getHeroSlides({})).toEqual([]);
      expect(getHeroSlides(undefined)).toEqual([]);
    });
  });

  describe('getHeroSlideImage', () => {
    it('should list every size with its width and use the largest as fallback', () => {
      expect(getHeroSlideImage({ large: 'l.jpg', medium: 'm.jpg', small: 's.jpg', alt: ' Tea ' })).toEqual({
        src: 'l.jpg',
        srcset: 's.jpg 500w, m.jpg 800w, l.jpg 1000w',
        alt: 'Tea',
      });
    });

    it('should leave out empty and repeated sizes and need no srcset for a single image', () => {
      expect(getHeroSlideImage({ large: 'l.jpg', medium: ' ', small: 's.jpg' })?.srcset).toBe(
        's.jpg 500w, l.jpg 1000w',
      );
      expect(getHeroSlideImage({ large: 'l.jpg', medium: 'l.jpg' })).toEqual({ src: 'l.jpg', srcset: '', alt: '' });
    });

    it('should return nothing without any image', () => {
      expect(getHeroSlideImage({ large: '', alt: 'Tea' })).toBeUndefined();
    });
  });

  describe('getHeroSliderImageUrls', () => {
    it('should build the three sizes of a picture in the slider folder', () => {
      const urls = getHeroSliderImageUrls(3);

      expect(urls.small).toMatch(/\/Grafiken\/slider\/slider-03-501\.jpg$/);
      expect(urls.medium).toMatch(/slider-03-801\.jpg$/);
      expect(urls.large).toMatch(/slider-03-1001\.jpg$/);
    });
  });

  describe('clampHeroSliderInterval', () => {
    it('should keep whole seconds of at least 3 and use 20 when unset or invalid', () => {
      expect(clampHeroSliderInterval(12.4)).toBe(12);
      expect(clampHeroSliderInterval(1)).toBe(3);
      expect(clampHeroSliderInterval(undefined)).toBe(20);
      expect(clampHeroSliderInterval('x')).toBe(20);
      expect(clampHeroSliderInterval(0)).toBe(20);
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
