import { BUILD_MARK_LENGTH, getBuildMark, getScriptFileNames, getServiceWorkerFileName } from '../scriptFileNames';

describe('scriptFileNames', () => {
  it('should mark a build with the first characters of its id, letters and digits only', () => {
    expect(getBuildMark('3F2A9C1B-77d4-4e1a-9b0c-5d6e7f8a9b0c')).toBe('3f2a9c1b');
    expect(getBuildMark('a1-b2-c3-d4-e5')).toBe('a1b2c3d4');
    expect(getBuildMark('3f2a9c1b-77d4-4e1a-9b0c-5d6e7f8a9b0c')).toHaveLength(BUILD_MARK_LENGTH);
  });

  it("should add the build mark to Nuxt's script file names in the build assets folder", () => {
    expect(getScriptFileNames('/_nuxt/', '3f2a9c1b-77d4-4e1a-9b0c-5d6e7f8a9b0c')).toBe('_nuxt/[hash]-3f2a9c1b.js');
    expect(getScriptFileNames('/_nuxt', 'abcdef12-0000')).toBe('_nuxt/[hash]-abcdef12.js');
  });

  it('should give two builds different script file names', () => {
    const first = getScriptFileNames('/_nuxt/', '3f2a9c1b-77d4-4e1a-9b0c-5d6e7f8a9b0c');
    const second = getScriptFileNames('/_nuxt/', '9e8d7c6b-1111-4222-8333-444455556666');
    expect(first).not.toBe(second);
  });

  it('should give the service worker the build mark, a new name for every build', () => {
    expect(getServiceWorkerFileName('3f2a9c1b-77d4-4e1a-9b0c-5d6e7f8a9b0c')).toBe('sw-3f2a9c1b.js');
    expect(getServiceWorkerFileName('9e8d7c6b-1111')).not.toBe(getServiceWorkerFileName('3f2a9c1b-0000'));
  });
});
