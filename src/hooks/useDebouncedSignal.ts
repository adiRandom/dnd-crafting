import type { Signal } from "@builder.io/qwik";
import { useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";


export function useDebouncedSignal<T>(
  value: Signal<T>,
  delay: number): Signal<T | undefined>;
export function useDebouncedSignal<T>(
  value: Signal<T>,
  delay: number,
  initialValue: T
): Signal<T>
export function useDebouncedSignal<T>(
  value: Signal<T>,
  delay: number,
  initialValue: T | undefined = undefined
): Signal<T | undefined> {

  const signal = useSignal(initialValue);
  const timeoutStore = useStore<{ timeout: number | undefined }>({ timeout: undefined });

  useVisibleTask$(({ track }) => {
    track(() => value.value);

    if (timeoutStore.timeout) { clearTimeout(timeoutStore.timeout) }

    timeoutStore.timeout = setTimeout(() => signal.value = value.value, delay) as unknown as number
  });

  return signal;
}