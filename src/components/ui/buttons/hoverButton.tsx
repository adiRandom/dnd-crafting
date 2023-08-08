import { PropFunction, component$, useStylesScoped$ } from "@builder.io/qwik";
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
    useStylesScoped$(`
    .button:hover {
      background-color: ${props.hoverColor};
    }

    .buttonSelected {
      background-color: ${props.hoverColor};
    }
  `);

    return (
        <button
            class={{
                [styles.button]: true,
                [styles[props.order]]: true,
                button: true,
                buttonSelected: props.selected,
            }}
            onClick$={props.onClick$}
        >
            {props.icon && <span class={styles.icon}>{props.icon}</span>}
            {props.label}
        </button>
    );
});
