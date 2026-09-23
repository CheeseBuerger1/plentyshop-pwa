import { mount } from '@vue/test-utils';
import DidYouKnow from '../DidYouKnow.vue';
import type { DidYouKnowContent, DidYouKnowProps } from '../types';

const createProps = (content: Partial<DidYouKnowContent> = {}): DidYouKnowProps => ({
  name: 'DidYouKnow',
  type: 'content',
  meta: { uuid: 'did-you-know-uuid' },
  content: {
    text: {
      title: 'Wussten Sie schon, dass...',
      facts: ['Fact one', 'Fact two', 'Fact three'],
      showIcon: true,
      textAlignment: 'center',
      ...content.text,
    },
    autoplay: { interval: 0, ...content.autoplay },
    layout: {
      backgroundColor: '#4B6A82',
      textColor: '#FFFFFF',
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 24,
      paddingRight: 24,
      ...content.layout,
    },
  },
});

const visibleFact = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('[data-testid="did-you-know-fact"]').find((fact) => fact.attributes('aria-hidden') === 'false');

describe('DidYouKnow', () => {
  describe('text', () => {
    it('should render the title and the question mark icon', () => {
      const wrapper = mount(DidYouKnow, { props: createProps() });

      expect(wrapper.get('[data-testid="did-you-know-title"]').text()).toBe('Wussten Sie schon, dass...');
      expect(wrapper.find('[data-testid="did-you-know-icon"]').exists()).toBe(true);
    });

    it('should hide the icon when showIcon is false', () => {
      const wrapper = mount(DidYouKnow, { props: createProps({ text: { showIcon: false } }) });

      expect(wrapper.find('[data-testid="did-you-know-icon"]').exists()).toBe(false);
    });

    it('should not render empty facts', () => {
      const wrapper = mount(DidYouKnow, { props: createProps({ text: { facts: ['Fact one', '  ', ''] } }) });

      expect(wrapper.findAll('[data-testid="did-you-know-fact"]')).toHaveLength(1);
    });

    it('should apply the right alignment classes', () => {
      const wrapper = mount(DidYouKnow, { props: createProps({ text: { textAlignment: 'left' } }) });

      expect(wrapper.get('[data-testid="did-you-know"]').classes()).toContain('text-left');
    });
  });

  describe('navigation', () => {
    it('should show the first fact initially', () => {
      const wrapper = mount(DidYouKnow, { props: createProps() });

      expect(visibleFact(wrapper)?.text()).toBe('Fact one');
    });

    it('should show the next fact and wrap around to the first', async () => {
      const wrapper = mount(DidYouKnow, { props: createProps() });
      const next = wrapper.get('[data-testid="did-you-know-next"]');

      await next.trigger('click');
      expect(visibleFact(wrapper)?.text()).toBe('Fact two');

      await next.trigger('click');
      await next.trigger('click');
      expect(visibleFact(wrapper)?.text()).toBe('Fact one');
    });

    it('should wrap around to the last fact when going back from the first', async () => {
      const wrapper = mount(DidYouKnow, { props: createProps() });

      await wrapper.get('[data-testid="did-you-know-previous"]').trigger('click');

      expect(visibleFact(wrapper)?.text()).toBe('Fact three');
    });

    it('should hide the arrows when there is only one fact', () => {
      const wrapper = mount(DidYouKnow, { props: createProps({ text: { facts: ['Only fact'] } }) });

      expect(wrapper.find('[data-testid="did-you-know-next"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="did-you-know-previous"]').exists()).toBe(false);
    });
  });

  describe('autoplay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should advance automatically when an interval is set', async () => {
      const wrapper = mount(DidYouKnow, { props: createProps({ autoplay: { interval: 5 } }) });

      vi.advanceTimersByTime(5000);
      await nextTick();

      expect(visibleFact(wrapper)?.text()).toBe('Fact two');
    });

    it('should not advance automatically when the interval is 0', async () => {
      const wrapper = mount(DidYouKnow, { props: createProps() });

      vi.advanceTimersByTime(60000);
      await nextTick();

      expect(visibleFact(wrapper)?.text()).toBe('Fact one');
    });

    it('should pause autoplay while hovered', async () => {
      const wrapper = mount(DidYouKnow, { props: createProps({ autoplay: { interval: 5 } }) });

      await wrapper.get('[data-testid="did-you-know"]').trigger('mouseenter');
      vi.advanceTimersByTime(10000);
      await nextTick();

      expect(visibleFact(wrapper)?.text()).toBe('Fact one');
    });
  });

  describe('layout', () => {
    it('should apply colours and padding from the layout settings', () => {
      const wrapper = mount(DidYouKnow, {
        props: createProps({ layout: { backgroundColor: '#DDEBC8', textColor: '#444444', paddingTop: 10 } }),
      });
      const style = wrapper.get('[data-testid="did-you-know"]').attributes('style');

      expect(style).toContain('background-color: #DDEBC8');
      expect(style).toContain('color: #444444');
      expect(style).toContain('padding-top: 10px');
    });

    it('should fall back to slate blue and white without colours', () => {
      const wrapper = mount(DidYouKnow, {
        props: createProps({ layout: { backgroundColor: '', textColor: '' } }),
      });
      const style = wrapper.get('[data-testid="did-you-know"]').attributes('style');

      expect(style).toContain('background-color: #4B6A82');
      expect(style).toContain('color: #FFFFFF');
    });
  });
});
