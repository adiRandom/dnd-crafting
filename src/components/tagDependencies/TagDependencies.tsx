import { Signal, component$ } from "@builder.io/qwik";
import styles from "./TagDependencies.module.css";
import { TagModel } from "~/models/tags";

export type TagDependenciesProps = {
    availableTags: Readonly<Signal<TagModel[]>>;
    selectedTags: Readonly<Signal<number[]>>;
    onClick$(tagId: number): void;
};

const TagDependencies = component$<TagDependenciesProps>(
    ({ availableTags, selectedTags, onClick$ }) => {
        return (
            <div>
                <h3 class={styles.inputLabel}>Form Tag Requirements</h3>
                <div class={styles.formTagRequirements}>
                    {availableTags.value.map((tag) => (
                        <div
                            key={tag.id}
                            class={{
                                [styles.formTagRequirement]: true,
                                [styles.selectedFormTagRequirement]:
                                    selectedTags.value.includes(tag.id),
                            }}
                            onClick$={() => {
                                onClick$(tag.id);
                            }}
                        >
                            {tag.name}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

export default TagDependencies;