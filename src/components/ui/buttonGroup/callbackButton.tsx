import { PropFunction, component$ } from "@builder.io/qwik";
import styles from "./button.module.css";

export type CallbackButtonProps = {
    label: string;
    onClick$: PropFunction<() => void>;
    order: "first" | "last" | "middle";
    icon: string;
};

export const CallbackButton = component$((props: CallbackButtonProps) => {
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
