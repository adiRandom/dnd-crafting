import type { PropFunction } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { CallbackButton } from "./callbackButton";
import styles from "./styles.module.css";
import buttonStyles from "./button.module.css";

export type ButtonOptions =
    | {
          label: string;
          onClick: PropFunction<() => void>;
          // Emoji
          icon: string;
      }
    | {
          label: string;
          href: string;
          // Emoji
          icon: string;
      };

export type ButtonGroupProps = {
    buttons: ButtonOptions[];
};

export const ButtonGroup = component$((props: ButtonGroupProps) => {
    return (
        <div class={styles.container}>
            {props.buttons.map((button, index) => {
                const order =
                    index === 0
                        ? "first"
                        : index === props.buttons.length - 1
                        ? "last"
                        : "middle";
                if ("onClick" in button) {
                    return (
                        <CallbackButton
                            label={button.label}
                            key={button.label}
                            onClick$={button.onClick}
                            order={order}
                            icon={button.icon}
                        >
                            {button.label}
                        </CallbackButton>
                    );
                } else {
                    return (
                        <Link
                            key={button.label}
                            class={`${buttonStyles.button} ${buttonStyles[order]}`}
                            href={button.href}
                        >
                            <span class={buttonStyles.icon}>{button.icon}</span>
                            {button.label}
                        </Link>
                    );
                }
            })}
        </div>
    );
});
