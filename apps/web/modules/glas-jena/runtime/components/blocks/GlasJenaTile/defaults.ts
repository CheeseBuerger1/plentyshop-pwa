import { v4 as uuid } from 'uuid';
import type { Block } from '@plentymarkets/shop-api';
import type { GlasJenaTileContent, GlasJenaTileTexts } from './types';
import {
  LTS_FACTORY_OUTLET_IMAGE_URL,
  TILE_BLUE,
  TILE_BLUE_TEXT_COLOR,
  TILE_DEFAULT_TEXT_COLOR,
  TILE_GREEN,
  TILE_BLOCK_NAME,
} from '../../../utils/home';

const MAP_URL =
  'https://www.google.de/maps/place/Werksverkauf+-GLAS+in+JENA-/@50.9246804,11.5770063,17z/data=!3m1!4b1!4m5!3m4!1s0x47a6a8bdf8376d27:0x2808737736c6cf7d!8m2!3d50.924677!4d11.579195?hl=de';
const FACTORY_OUTLET_URL = 'https://www.glas-in-jena.de/';
const OUR_GLASS_PATH = '/sbc5/our-glass/';

const createTile = (content: GlasJenaTileContent): Block => ({
  name: TILE_BLOCK_NAME,
  type: 'content',
  meta: { uuid: uuid() },
  configuration: {
    visible: true,
  },
  content,
});

const factoryOutlet = ({ title, html, more }: GlasJenaTileTexts): Block =>
  createTile({
    text: { title, htmlDescription: html },
    button: { label: more, link: FACTORY_OUTLET_URL, openInNewTab: true },
    layout: {
      backgroundColor: TILE_GREEN,
      textColor: TILE_DEFAULT_TEXT_COLOR,
      backgroundImage: LTS_FACTORY_OUTLET_IMAGE_URL,
    },
    collapsibleOnMobile: true,
  });

const ourGlass = ({ title, html, more }: GlasJenaTileTexts): Block =>
  createTile({
    text: { title, htmlDescription: html },
    button: { label: more, link: OUR_GLASS_PATH, openInNewTab: false },
    layout: { backgroundColor: TILE_BLUE, textColor: TILE_BLUE_TEXT_COLOR, backgroundImage: '' },
    collapsibleOnMobile: true,
  });

/* Texts of the LTS shop's home page (German and English version) */
const mapLink = (label: string) => `<p><a href="${MAP_URL}" target="_blank" rel="noreferrer">» ${label}</a></p>`;

const FACTORY_OUTLET_DE = {
  title: 'Werksverkauf',
  more: 'Mehr',
  html: [
    '<p>Deutschlands größte Auswahl an Hitzebeständigem Glas<br>Kristallglas - <strong>Made in Germany</strong></p>',
    '<p><strong>GLAS<sup>in</sup>JENA</strong><br>Westbahnhofstraße 8<br>07745 Jena<br>Deutschland</p>',
    '<p><strong>Öffnungszeiten</strong><br>Mo - Fr: 10:00 - 18:00 Uhr<br>Sa: 10:00 - 13:00 Uhr</p>',
    mapLink('Zur Kartenansicht'),
  ].join(''),
};

const FACTORY_OUTLET_EN = {
  title: 'Factory Outlet',
  more: 'More',
  html: [
    "<p>Germany's largest selection of heat resistant glass<br>Crystal glass - <strong>Made in Germany</strong></p>",
    '<p><strong>GLAS<sup>in</sup>JENA</strong><br>Westbahnhofstraße 8<br>07745 Jena<br>Germany</p>',
    '<p><strong>Opening hours</strong><br>Mo - Fr: 10:00 am - 06:00 pm<br>Sa: 10:00 am - 01:00 pm</p>',
    mapLink('Map View'),
  ].join(''),
};

const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

const OUR_GLASS_DE = {
  title: 'Unser hitzebeständiges Glas',
  more: 'Mehr',
  html: list([
    'eignet sich zur gesunden und sicheren Lebensmittelzubereitung',
    'ist leicht zu reinigen und hygienisch im Gebrauch durch die porenfreie Oberfläche',
    'bietet eine Vielzahl an Verwendungsmöglichkeiten: Backen, Garen, Zubereiten, Servieren, Kühlen und Einfrieren (bis -35°C)',
    'ist hitzebeständig (bis 450°C), mikrowellen- und mikrowellengrillgeeignet, spülmaschinengeeignet, ofentauglich',
    'ist gegen schnellen Temperaturwechsel mit Temperaturunterschieden von bis zu 150°C resistent',
  ]),
};

const OUR_GLASS_EN = {
  title: 'Our heat resistant glass',
  more: 'More',
  html: list([
    'is suitable for healthy and safe food preparation',
    'is easy to clean and hygienic in use through the pore-free surface',
    'offers a variety of application possibilities: baking and cooking, preparing and serving, cooling and freezing (down to -35 ° C)',
    'is heat resistant (up to 450 ° C), microwave, microwave grill suitable, dishwasher and stove fit',
    'shows a high resistance to sudden temperature changes with a temperature difference of up to 150 ° C',
  ]),
};

/* Own category key, so the block keeps its own access control (see DidYouKnow/defaults.ts) */
export const getBlocksList = (): BlocksList => ({
  glasJenaTile: {
    category: 'glasJenaTile',
    accessControl: ['content', 'productCategory'],
    title: 'Tile (GLAS IN JENA)',
    blockName: TILE_BLOCK_NAME,
    variations: [
      {
        title: 'Werksverkauf',
        template: { en: factoryOutlet(FACTORY_OUTLET_EN), de: factoryOutlet(FACTORY_OUTLET_DE) },
      },
      {
        title: 'Unser hitzebeständiges Glas',
        template: { en: ourGlass(OUR_GLASS_EN), de: ourGlass(OUR_GLASS_DE) },
      },
    ],
  },
});

export const createDefault = (): Block =>
  createTile({
    text: { title: 'Title', htmlDescription: '<p>Text</p>' },
    button: { label: '', link: '', openInNewTab: false },
    layout: { backgroundColor: TILE_GREEN, textColor: TILE_DEFAULT_TEXT_COLOR, backgroundImage: '' },
    collapsibleOnMobile: true,
  });
