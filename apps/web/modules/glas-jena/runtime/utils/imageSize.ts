/**
 * Size of a picture in pixels, read by loading it in the browser (editor forms store it with the picture, see the
 * tile block). `undefined` on the server, if the picture does not load or has no size (e.g. some SVG files).
 *
 * @param url Address of the picture.
 */
export const readImageSize = (url: string) =>
  new Promise<{ width: number; height: number } | undefined>((resolve) => {
    if (typeof Image === 'undefined' || !url) {
      resolve(undefined);
      return;
    }
    const image = new Image();
    image.onload = () =>
      resolve(
        image.naturalWidth && image.naturalHeight
          ? { width: image.naturalWidth, height: image.naturalHeight }
          : undefined,
      );
    image.onerror = () => resolve(undefined);
    image.src = url;
  });
