/** A language in its own name with a capital first letter, e.g. "English" for `en` and "Deutsch" for `de` (like the LTS shop). */
export const getNativeLanguageName = (locale: string) => {
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
  return name.charAt(0).toUpperCase() + name.slice(1);
};
