import { readImageSize } from '../imageSize';

/** Stand-in for the browser's Image: "loads" right after `src` is set, with the given size or an error */
const stubImage = (result: { width: number; height: number } | 'error') => {
  class FakeImage {
    naturalWidth = 0;
    naturalHeight = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(_url: string) {
      queueMicrotask(() => {
        if (result === 'error') {
          this.onerror?.();
          return;
        }
        this.naturalWidth = result.width;
        this.naturalHeight = result.height;
        this.onload?.();
      });
    }
  }
  vi.stubGlobal('Image', FakeImage);
};

describe('readImageSize', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should read the size of a loaded picture', async () => {
    stubImage({ width: 325, height: 207 });

    expect(await readImageSize('highlight-tee.jpg')).toEqual({ width: 325, height: 207 });
  });

  it('should give no size for a picture that does not load or has no size', async () => {
    stubImage('error');
    expect(await readImageSize('missing.jpg')).toBeUndefined();

    stubImage({ width: 0, height: 0 });
    expect(await readImageSize('icon.svg')).toBeUndefined();
  });

  it('should give no size without an address', async () => {
    stubImage({ width: 325, height: 207 });

    expect(await readImageSize('')).toBeUndefined();
  });
});
