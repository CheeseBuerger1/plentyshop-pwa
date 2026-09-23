import { mount } from '@vue/test-utils';
import type { Block, GetBlocksResponse } from '@plentymarkets/shop-api';
import DidYouKnowForm from '../DidYouKnowForm.vue';
import type { DidYouKnowContent } from '../types';

const buildBlock = (uuid: string, content: Partial<DidYouKnowContent>): Block => ({
  name: 'DidYouKnow',
  type: 'content',
  meta: { uuid },
  configuration: { visible: true },
  content,
});

const mountForm = (uuid: string, content: Partial<DidYouKnowContent> = {}) => {
  const { restoreBlocks } = useBlocks();
  restoreBlocks({ blocks: [buildBlock(uuid, content)] } as GetBlocksResponse);

  return mount(DidYouKnowForm, { props: { uuid } });
};

const getContent = (uuid: string) => {
  const { allBlocks } = useBlocks();
  const { findOrDeleteBlockByUuid } = useBlockManager();

  return (findOrDeleteBlockByUuid(allBlocks.value, uuid) as Block).content as DidYouKnowContent;
};

const facts = ['Fact one', 'Fact two', 'Fact three'];

describe('DidYouKnowForm', () => {
  it('should fill in defaults for missing settings', () => {
    mountForm('did-you-know-defaults');

    const content = getContent('did-you-know-defaults');

    expect(content.text.facts).toEqual(['']);
    expect(content.text.showIcon).toBe(true);
    expect(content.text.textAlignment).toBe('center');
    expect(content.autoplay?.interval).toBe(0);
    expect(content.layout.backgroundColor).toBe('#4B6A82');
    expect(content.layout.textColor).toBe('#FFFFFF');
  });

  it('should update the title', async () => {
    const wrapper = mountForm('did-you-know-title', { text: { title: 'Old' } });

    await wrapper.find('[data-testid="did-you-know-title-input"]').setValue('Wussten Sie schon, dass...');

    expect(getContent('did-you-know-title').text.title).toBe('Wussten Sie schon, dass...');
  });

  it('should edit a fact', async () => {
    const wrapper = mountForm('did-you-know-edit', { text: { facts: [...facts] } });

    await wrapper.find('[data-testid="did-you-know-fact-input-1"]').setValue('Changed fact');

    expect(getContent('did-you-know-edit').text.facts?.[1]).toBe('Changed fact');
  });

  it('should add an empty fact', async () => {
    const wrapper = mountForm('did-you-know-add', { text: { facts: [...facts] } });

    await wrapper.find('[data-testid="did-you-know-add-fact"]').trigger('click');

    expect(getContent('did-you-know-add').text.facts).toEqual([...facts, '']);
  });

  it('should remove a fact', async () => {
    const wrapper = mountForm('did-you-know-remove', { text: { facts: [...facts] } });

    await wrapper.find('[data-testid="did-you-know-fact-remove-0"]').trigger('click');

    expect(getContent('did-you-know-remove').text.facts).toEqual(['Fact two', 'Fact three']);
  });

  it('should keep at least one fact', async () => {
    const wrapper = mountForm('did-you-know-min', { text: { facts: ['Only fact'] } });

    await wrapper.find('[data-testid="did-you-know-fact-remove-0"]').trigger('click');

    expect(getContent('did-you-know-min').text.facts).toEqual(['Only fact']);
  });

  it('should move a fact up and down', async () => {
    const wrapper = mountForm('did-you-know-move', { text: { facts: [...facts] } });

    await wrapper.find('[data-testid="did-you-know-fact-up-1"]').trigger('click');
    expect(getContent('did-you-know-move').text.facts).toEqual(['Fact two', 'Fact one', 'Fact three']);

    await wrapper.find('[data-testid="did-you-know-fact-down-1"]').trigger('click');
    expect(getContent('did-you-know-move').text.facts).toEqual(['Fact two', 'Fact three', 'Fact one']);
  });

  it('should update the autoplay interval and padding', async () => {
    const wrapper = mountForm('did-you-know-numbers', { text: { facts: [...facts] } });

    await wrapper.find('[data-testid="did-you-know-autoplay"]').setValue('6');
    await wrapper.find('[data-testid="did-you-know-padding-top"]').setValue('12');

    const content = getContent('did-you-know-numbers');
    expect(content.autoplay?.interval).toBe(6);
    expect(content.layout.paddingTop).toBe(12);
  });
});
