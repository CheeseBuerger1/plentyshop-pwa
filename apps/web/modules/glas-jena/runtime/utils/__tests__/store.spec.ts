import { getStoreJsonLd } from '../store';

describe('getStoreJsonLd', () => {
  it('should describe the factory outlet with address and opening hours', () => {
    const store = getStoreJsonLd('https://www.glas-jena.de', 'https://cdn02.plentyone.com/logo.png');

    expect(store).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'GLAS in JENA',
      url: 'https://www.glas-jena.de',
      image: 'https://cdn02.plentyone.com/logo.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Westbahnhofstraße 8',
        postalCode: '07745',
        addressLocality: 'Jena',
        addressCountry: 'DE',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '10:00',
          closes: '18:00',
        },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '13:00' },
      ],
    });
  });

  it('should leave the image out without a logo', () => {
    expect(getStoreJsonLd('https://www.glas-jena.de')).not.toHaveProperty('image');
  });
});
