import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import GlasJenaCancellationForm from '../GlasJenaCancellationForm.vue';

const { settings } = vi.hoisted(() => ({
  settings: { turnstileSiteKey: '', recipient: '' },
}));

mockNuxtImport('useCancellationForm', () => () => ({
  loading: ref(false),
  submitCancellation: vi.fn(),
  validationSchema: undefined,
  turnstileSiteKey: settings.turnstileSiteKey,
}));
mockNuxtImport('useSiteSettings', () => () => ({ getSetting: () => settings.recipient }));

const mountForm = () => mountSuspended(GlasJenaCancellationForm);

describe('GlasJenaCancellationForm', () => {
  afterEach(() => {
    settings.turnstileSiteKey = '';
    settings.recipient = '';
  });

  it('should show the hint instead of the form while the form is not configured', async () => {
    settings.turnstileSiteKey = 'site-key';

    const wrapper = await mountForm();

    expect(wrapper.find('[data-testid="gj-cancellation-form-misconfigured"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="cancellation-form"]').exists()).toBe(false);
  });

  it('should show the fields in the order of the LTS form once it is configured', async () => {
    settings.turnstileSiteKey = 'site-key';
    settings.recipient = 'shop@example.com';

    const wrapper = await mountForm();
    const fieldIds = wrapper
      .findAll('[data-testid="cancellation-form"] :is(input, textarea)')
      .map((field) => field.attributes('id'));

    expect(fieldIds).toEqual([
      'cancellation-name',
      'cancellation-order-id',
      'cancellation-email',
      'cancellation-reason',
    ]);
  });

  it('should label the form with its heading', async () => {
    const wrapper = await mountForm();
    const section = wrapper.find('[data-testid="gj-cancellation-form"]');

    expect(section.attributes('aria-labelledby')).toBe('gj-cancellation-form-title');
    expect(wrapper.find('#gj-cancellation-form-title').element.tagName).toBe('H2');
  });
});
