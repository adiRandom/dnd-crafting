import { PropFunction, component$ } from "@builder.io/qwik";
import styles from "./crackedButton.module.css";

export type CrackedButtonProps = {
    label: string;
    onClick$: PropFunction<() => void>;
    order: "first" | "last" | "middle";
    icon: string;
};

export const CrackedButton = component$((props: CrackedButtonProps) => {
    return (
        <button
            class={`${styles.button} ${styles[props.order]}`}
            onClick$={props.onClick$}
        >
            <span class={styles.icon}>{props.icon}</span>
            {props.label}
        </button>
    );
});
