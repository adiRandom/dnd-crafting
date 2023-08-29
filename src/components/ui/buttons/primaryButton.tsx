import { ClassList, PropFunction, component$ } from "@builder.io/qwik";
import styles from "./primaryButton.module.css";

export type PrimaryButtonProps = {
    label: string;
    class?: ClassList[];
    onClick$: PropFunction<() => void>;
};

export const PrimaryButton = component$((props: PrimaryButtonProps) => {
    return (
        <button
            class={[styles.btn, ...(props.class ?? [])]}
            onClick$={props.onClick$}
        >
            {props.label}
        </button>
    );
});
