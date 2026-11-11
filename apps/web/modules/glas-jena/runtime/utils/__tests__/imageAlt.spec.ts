import type { ImagesData } from '@plentymarkets/shop-api';
import { withImageAlternate } from '../imageAlt';

/** A picture as PlentyONE delivers it, with or without alternative text */
const image = (names: ImagesData['names']) =>
  ({
    cleanImageName: '77166004-NOVA-S.jpg',
    url: 'https://cdn02.plentyone.com/77166004-NOVA-S.jpg',
    names,
  }) as ImagesData;

describe('withImageAlternate', () => {
  it("should give pictures without alternative text the item's name instead of the file name", () => {
    const [withoutText, withoutNames] = withImageAlternate(
      [image({ alternate: '', imageId: 1, lang: 'de', name: '' }), image([])],
      'Teekanne NOVA+ 1.2l - S',
    );

    expect(withoutText?.names).toEqual({ alternate: 'Teekanne NOVA+ 1.2l - S', imageId: 1, lang: 'de', name: '' });
    expect(withoutNames?.names).toMatchObject({ alternate: 'Teekanne NOVA+ 1.2l - S' });
    expect(withoutText?.url).toBe('https://cdn02.plentyone.com/77166004-NOVA-S.jpg');
  });

  it('should keep the alternative text of a picture that has one', () => {
    const own = image({ alternate: 'Teekanne mit Edelstahlfilter', imageId: 1, lang: 'de', name: '' });

    expect(withImageAlternate([own], 'Teekanne NOVA+ 1.2l - S')).toEqual([own]);
  });

  it('should leave all pictures as they are without a name', () => {
    const images = [image([])];

    expect(withImageAlternate(images, '')).toBe(images);
  });
});
