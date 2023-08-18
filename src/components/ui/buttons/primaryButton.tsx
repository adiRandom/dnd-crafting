import { PropFunction, component$ } from "@builder.io/qwik";
import styles from "./primaryButton.module.css";

export type PrimaryButtonProps = {
  label: string;
  onClick$: PropFunction<() => void>;
}

export const PrimaryButton = component$((props: PrimaryButtonProps) => {
  return (
    <button class={styles.btn} onClick$={props.onClick$}>
      {props.label}
    </button>
  );
})
