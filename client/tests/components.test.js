import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from '../src/components/common/BaseButton.vue';
import BaseInput from '../src/components/common/BaseInput.vue';
import BaseBadge from '../src/components/common/BaseBadge.vue';
import { money } from '../src/utils/format';

describe('BaseButton', () => {
  it('renders its label as a real button', () => {
    const w = mount(BaseButton, { slots: { default: 'Save' } });
    expect(w.element.tagName).toBe('BUTTON');
    expect(w.text()).toBe('Save');
  });
  it('is disabled and announced as busy while loading', () => {
    const w = mount(BaseButton, { props: { loading: true }, slots: { default: 'Save' } });
    expect(w.attributes('disabled')).toBeDefined();
    expect(w.attributes('aria-busy')).toBe('true');
  });
});

describe('BaseInput', () => {
  it('links the label to the input and emits v-model updates', async () => {
    const w = mount(BaseInput, { props: { label: 'Email', modelValue: '' } });
    const input = w.find('input');
    expect(w.find('label').attributes('for')).toBe(input.attributes('id'));
    await input.setValue('a@b.com');
    expect(w.emitted('update:modelValue')[0]).toEqual(['a@b.com']);
  });
  it('shows errors accessibly', () => {
    const w = mount(BaseInput, { props: { label: 'Email', error: 'Enter a valid email' } });
    expect(w.find('input').attributes('aria-invalid')).toBe('true');
    expect(w.text()).toContain('Enter a valid email');
  });
});

describe('misc', () => {
  it('badge renders slot', () =>
    expect(mount(BaseBadge, { slots: { default: 'New' } }).text()).toBe('New'));
  it('formats money', () => expect(money(1234.5)).toBe('$1,234.50'));
});
