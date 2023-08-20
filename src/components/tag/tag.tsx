import { PropFunction, component$, useSignal, $ } from "@builder.io/qwik";
import type { TagModel } from "~/models/tags";
import styles from "./tag.module.css";
import TagBackground from "./tagBackground";
import { DISABLED_BORDER, PRIMARY_BORDER, PRIMARY_HOVER } from "~/theme/color";

export type TagProps = {
    tag: TagModel;
    isSelected: boolean;
    canBeSelected: boolean;
    onHover$: PropFunction<(isHovering: boolean) => void>;
};

const Tag = component$(
    ({ tag, isSelected, canBeSelected, onHover$ }: TagProps) => {
        const isHovering = useSignal(false);

        const onMouseEnter = $(() => {
            if (canBeSelected) {
                isHovering.value = true;
            }

            onHover$(true);
        });

        const onMouseLeave = $(() => {
            if (canBeSelected) {
                isHovering.value = false;
            }

            onHover$(false);
        });

        return (
            <div
                class={styles.tagContainer}
                onMouseEnter$={onMouseEnter}
                onMouseLeave$={onMouseLeave}
            >
                <TagBackground
                    class={styles.tagBg}
                    color={canBeSelected ? PRIMARY_BORDER : DISABLED_BORDER}
                    fillColor={
                        isHovering.value || isSelected
                            ? PRIMARY_HOVER
                            : "rgba(0, 0, 0, 0)"
                    }
                />
                <h1
                    class={{
                        [styles.tagName]: true,
                        [styles.tagNameDisabled]: !canBeSelected,
                    }}
                >
                    {tag.name}
                </h1>
            </div>
        );
    }
);

export default Tag;
