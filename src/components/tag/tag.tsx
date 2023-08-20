import { component$, useSignal } from "@builder.io/qwik";
import { TagModel } from "~/models/tags";
import styles from "./tag.module.css";
import TagBackground from "./tagBackground";

export type TagProps = {
    tag: TagModel;
    isSelected: boolean;
    canBeSelected: boolean;
    onHover$(isHovering: boolean): void;
};

const Tag = component$(({ tag, isSelected, canBeSelected }: TagProps) => {
    const isHovering = useSignal(false);

    return (
        <div
            class={styles.tagContainer}
            onMouseEnter$={() => {
                isHovering.value = true;
            }}
            onMouseLeave$={() => {
                isHovering.value = false;
            }}
        >
            <TagBackground
                class={styles.tagBg}
                color={"rgba(66, 32, 69, 1)"}
                fillColor={
                    isHovering.value
                        ? "rgba(66, 32, 69, 0.5)"
                        : "rgba(66, 32, 69, 0)"
                }
            />
            <h1 class={styles.tagName}>{tag.name}</h1>
        </div>
    );
});

export default Tag;
