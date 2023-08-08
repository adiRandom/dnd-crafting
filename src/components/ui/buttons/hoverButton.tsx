import { PropFunction, component$, useSignal } from "@builder.io/qwik";
import styles from "./hoverButton.module.css";

export type HoverButtonProps = {
    label: string;
    onClick$: PropFunction<() => void>;
    order: "first" | "last" | "middle";
    icon?: string;
    hoverColor: string;
    selected?: boolean;
};

export const HoverButton = component$((props: HoverButtonProps) => {
    const isHovered = useSignal(false);

    return (
        <button
            class={{
                [styles.button]: true,
                [styles[props.order]]: true,
            }}
            onMouseEnter$={() => (isHovered.value = true)}
            onMouseLeave$={() => (isHovered.value = false)}
            style={{
                backgroundColor:
                    isHovered.value || props.selected
                        ? props.hoverColor
                        : undefined,
            }}
            onClick$={props.onClick$}
        >
            {props.icon && <span class={styles.icon}>{props.icon}</span>}
            {props.label}
        </button>
    );
});
