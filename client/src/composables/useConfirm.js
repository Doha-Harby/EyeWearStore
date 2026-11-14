import { reactive, readonly } from 'vue';

const defaults = {
  title: 'Are you sure?',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  tone: 'default',
};
const state = reactive({ open: false, ...defaults });
let resolver = null;

function settle(answer) {
  state.open = false;
  resolver?.(answer);
  resolver = null;
}

/**
 * Promise-based confirmation dialog, replacing the browser's ugly window.confirm().
 *   const { confirm } = useConfirm();
 *   if (await confirm({ title: 'Delete product?', tone: 'danger' })) { ... }
 * State is module-level on purpose: one dialog instance, shared by the whole app.
 */
export function useConfirm() {
  const confirm = (options = {}) =>
    new Promise((resolve) => {
      Object.assign(state, defaults, options, { open: true });
      resolver = resolve;
    });
  return {
    state: readonly(state),
    confirm,
    accept: () => settle(true),
    cancel: () => settle(false),
  };
}
