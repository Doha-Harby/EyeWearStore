import { useToastStore } from '@/stores/toast';

/** Usage: const toast = useToast(); toast.success('Saved'); */
export const useToast = () => useToastStore();
