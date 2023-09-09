import { component$, useComputed$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import { Tool } from "~/models/tool";
import {
    createTag,
    deleteTag,
    getAllTags,
    getTools,
    updateTag,
} from "~/server/repository";
import styles from "./index.module.css";
import {
    SlotCost,
    TagModel,
    TagType,
    doesTagTakeAllSlots,
} from "~/models/tags";
import { Rarity } from "~/models/rarity";

export const useTools = routeLoader$(() => getTools());
export const useTags = routeLoader$(() => getAllTags());

export default component$(() => {
    const tools = useTools();
    const initialTags = useTags();
    const tags = useSignal(initialTags.value);
    const selectedTag = useSignal(null as TagModel | null);
    const isEdit = useComputed$(() => !!selectedTag.value);

    const tagName = useSignal("");
    const tagType = useSignal(TagType.FormTag);
    const tagDescription = useSignal("");
    const minRarity = useSignal(Rarity.Common);
    const slotCost = useSignal("");
    const formTagRequirements = useSignal([] as number[]);
    const itemName = useSignal("");
    const selectedTool = useSignal<Tool | null>(tools.value[0] ?? null);

    const availableFormTagsDependencies = useComputed$(() => {
        if (selectedTool.value === null ||  tagType.value === TagType.FormTag) {
            return [];
        } 

        return tags.value.filter(
            (tag) =>
                tag.type === TagType.FormTag &&
                tag.toolId === selectedTool.value?.id
        );
    });

    const clearForm = $(() => {
        selectedTag.value = null;

        tagName.value = "";
        tagType.value = TagType.FormTag;
        tagDescription.value = "";
        minRarity.value = Rarity.Common;
        slotCost.value = "";
        formTagRequirements.value = [];
        itemName.value = "";
        selectedTool.value = null;
    });

    const onSubmit = $(async () => {
        if (selectedTool.value === null) {
            return;
        }

        let cost: SlotCost | undefined = undefined;

        if (slotCost.value === "-1") {
            cost = { takeAll: true };
        } else {
            const value = Number.parseInt(slotCost.value);
            if (Number.isNaN(value)) {
                cost = { value: 0 };
            } else {
                cost = { value };
            }
        }

        if (isEdit.value) {
            const result = await updateTag({
                ...selectedTag.value!,
                name: tagName.value,
                type: tagType.value,
                description: tagDescription.value,
                minRarity: minRarity.value,
                slotCost: cost,
                tagRequirementId: formTagRequirements.value,
                itemName: itemName.value,
                toolId: selectedTool.value.id,
            } as TagModel);

            tags.value = tags.value.map((tag) =>
                tag.id === result?.id ? result! : tag
            );
        } else {
            const result = await createTag({
                id: 0,
                name: tagName.value,
                type: tagType.value,
                description: tagDescription.value,
                minRarity: minRarity.value,
                slotCost: cost,
                tagRequirementId: formTagRequirements.value,
                itemName: itemName.value,
                toolId: selectedTool.value.id,
            });

            tags.value = [...tags.value, result];
        }

        clearForm();
    });

    const onDelete = $(async () => {
        if (selectedTag.value) {
            await deleteTag(selectedTag.value.id);

            tags.value = tags.value.filter(
                (tag) => tag.id !== selectedTag.value?.id
            );
        }

        clearForm();
    });

    const onCellClick = $(async (tag: TagModel) => {
        if (selectedTag.value?.id === tag.id) {
            clearForm();
            return;
        }

        const tool = tools.value.find((tool) => tool.id === tag.toolId);
        if (!tool) {
            return;
        }

        selectedTag.value = tag;

        tagName.value = tag.name;
        tagType.value = tag.type;
        tagDescription.value = tag.description;
        minRarity.value = tag.minRarity;
        slotCost.value = doesTagTakeAllSlots(tag.slotCost)
            ? "-1"
            : tag.slotCost.value.toString();
        formTagRequirements.value = tag.tagRequirementId;
        console.log(tag.tagRequirementId)
        itemName.value = tag.itemName ?? "";
        selectedTool.value = tool;
    });

    return (
        <div class={styles.main}>
            <h1>Tags</h1>
            <div class={styles.panes}>
                <div class={styles.leftPane}>
                    {tags.value.map((tag) => (
                        <div
                            class={{
                                [styles.cell]: true,
                                [styles.selectedCell]:
                                    selectedTag.value?.id === tag.id,
                            }}
                            key={tag.id}
                            onClick$={() => onCellClick(tag)}
                        >
                            <h2 class={styles.toolName}>{tag.name}</h2>
                            <h3 class={styles.cellSubtitle}>
                                {tag.type === TagType.FormTag
                                    ? "Form Tag"
                                    : "Effect Tag"}
                            </h3>
                            <h3 class={styles.cellSubtitle}>
                                {
                                    tools.value.find(
                                        (tool) => tool.id === tag.toolId
                                    )?.name
                                }
                            </h3>
                        </div>
                    ))}
                </div>
                <div class={styles.rightPane}>
                    <h2>{isEdit.value ? "Edit Tag" : "Add Tag"}</h2>
                    <div class={styles.inputContainer}>
                        <h3 class={styles.inputLabel}>Tag Name</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={tagName.value}
                            onChange$={(ev) =>
                                (tagName.value = ev.target.value)
                            }
                        />

                        <h3 class={styles.inputLabel}>Tag Type</h3>
                        <select
                            class={styles.selectInput}
                            value={tagType.value}
                            onChange$={(ev) =>
                                (tagType.value = Number.parseInt(
                                    ev.target.value
                                ) as TagType)
                            }
                        >
                            <option value={TagType.FormTag}>Form Tag</option>
                            <option value={TagType.EffectTag}>
                                Effect Tag
                            </option>
                        </select>

                        <h3 class={styles.inputLabel}>Tag Description</h3>
                        <textarea
                            class={styles.textArea}
                            value={tagDescription.value}
                            onChange$={(ev) =>
                                (tagDescription.value = ev.target.value)
                            }
                        />

                        <h3 class={styles.inputLabel}>Minimum Rarity</h3>
                        <select
                            class={styles.selectInput}
                            value={minRarity.value}
                            onChange$={(ev) =>
                                (minRarity.value = ev.target.value as Rarity)
                            }
                        >
                            <option value={Rarity.Common}>Common</option>
                            <option value={Rarity.Uncommon}>Uncommon</option>
                            <option value={Rarity.Rare}>Rare</option>
                            <option value={Rarity.VeryRare}>Very Rare</option>
                            <option value={Rarity.Legendary}>Legendary</option>
                        </select>

                        <h3 class={styles.inputLabel}>
                            Slot Cost [-1 means Takes All]
                        </h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={slotCost.value}
                            onChange$={(ev) =>
                                (slotCost.value = ev.target.value)
                            }
                        />

                        <h3 class={styles.inputLabel}>Tool</h3>
                        <select
                            class={styles.selectInput}
                            value={selectedTool.value?.id}
                            onChange$={(ev) => {
                                selectedTool.value =
                                    tools.value.find(
                                        (tool) =>
                                            tool.id ===
                                            Number.parseInt(ev.target.value)
                                    ) ?? null;
                            }}
                        >
                            {tools.value.map((tool) => (
                                <option key={tool.id} value={tool.id}>
                                    {tool.name}
                                </option>
                            ))}
                        </select>

                        <h3 class={styles.inputLabel}>Item Name</h3>
                        <input
                            class={styles.input}
                            type="text"
                            value={itemName.value}
                            onChange$={(ev) =>
                                (itemName.value = ev.target.value)
                            }
                        />

                        {availableFormTagsDependencies.value.length != 0 && (
                            <>
                                <h3 class={styles.inputLabel}>
                                    Form Tag Requirements
                                </h3>
                                <div class={styles.formTagRequirements}>
                                    {availableFormTagsDependencies.value.map(
                                        (tag) => (
                                            <div
                                                key={tag.id}
                                                class={{
                                                    [styles.formTagRequirement]:
                                                        true,
                                                    [styles.selectedFormTagRequirement]:
                                                        formTagRequirements.value.includes(
                                                            tag.id
                                                        ),
                                                }}
                                                onClick$={() => {
                                                    if (
                                                        formTagRequirements.value.includes(
                                                            tag.id
                                                        )
                                                    ) {
                                                        formTagRequirements.value =
                                                            formTagRequirements.value.filter(
                                                                (id) =>
                                                                    id !==
                                                                    tag.id
                                                            );
                                                    } else {
                                                        formTagRequirements.value =
                                                            [
                                                                ...formTagRequirements.value,
                                                                tag.id,
                                                            ];
                                                    }
                                                }}
                                            >
                                                {tag.name}
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div class={styles.buttonBar}>
                        <PrimaryButton onClick$={onSubmit} label="Submit" />
                        <PrimaryButton
                            class={[styles.delete]}
                            onClick$={onDelete}
                            label="Delete"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
