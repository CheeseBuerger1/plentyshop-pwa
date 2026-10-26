import { hreflangLocaleMapperToI18n } from '~/composables/useUrlPageMeta/hreflangLocaleMapperToI18n';

/** Key of `languageUrls` for the address search engines get when no language fits; not a language of the shop. */
export const DEFAULT_LANGUAGE_URL_KEY = 'x-default';

/** A language in its own name with a capital first letter, e.g. "English" for `en` and "Deutsch" for `de` (like the LTS shop). */
export const getNativeLanguageName = (locale: string) => {
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Path of a category in a language of the shop, without the language prefix, e.g. `/kitchen-helpers/bowls` for `en`:
 * from the category's `languageUrls`, whose keys are hreflang codes (the same source as the category's hreflang
 * links, see useUrlPageMeta). Undefined when the category has no address in that language.
 */
export const getCategoryLanguagePath = (languageUrls: Record<string, string> | undefined, locale: string) => {
  const key = Object.keys(languageUrls ?? {}).find(
    (hreflang) => hreflang !== DEFAULT_LANGUAGE_URL_KEY && hreflangLocaleMapperToI18n(hreflang) === locale,
  );
  return (key && languageUrls?.[key]) || undefined;
};
