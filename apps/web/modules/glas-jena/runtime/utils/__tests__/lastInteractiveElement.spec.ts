import { getLastInteractiveElement, rememberInteractiveElement } from '../lastInteractiveElement';

describe('lastInteractiveElement', () => {
  const createButtonWithIcon = () => {
    const button = document.createElement('button');
    const icon = document.createElement('span');
    button.appendChild(icon);

    return { button, icon };
  };

  it('should remember a button', () => {
    const { button } = createButtonWithIcon();

    rememberInteractiveElement(button);

    expect(getLastInteractiveElement()).toBe(button);
  });

  it('should remember the button when something inside it, like an icon, is clicked', () => {
    const { button, icon } = createButtonWithIcon();

    rememberInteractiveElement(icon);

    expect(getLastInteractiveElement()).toBe(button);
  });

  it('should remember links and elements that can be reached with Tab', () => {
    const link = document.createElement('a');
    link.setAttribute('href', '/cart');
    const custom = document.createElement('div');
    custom.setAttribute('tabindex', '0');

    rememberInteractiveElement(link);
    expect(getLastInteractiveElement()).toBe(link);

    rememberInteractiveElement(custom);
    expect(getLastInteractiveElement()).toBe(custom);
  });

  it('should keep the last control when something else is clicked', () => {
    const { button } = createButtonWithIcon();
    rememberInteractiveElement(button);

    rememberInteractiveElement(document.createElement('p'));
    rememberInteractiveElement(null);

    expect(getLastInteractiveElement()).toBe(button);
  });

  it('should ignore elements that only the program can focus (tabindex -1), like a dialog', () => {
    const { button } = createButtonWithIcon();
    const dialog = document.createElement('section');
    dialog.setAttribute('tabindex', '-1');
    rememberInteractiveElement(button);

    rememberInteractiveElement(dialog);

    expect(getLastInteractiveElement()).toBe(button);
  });
});
