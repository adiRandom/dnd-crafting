import { component$ } from "@builder.io/qwik";
import Tag from "~/components/tag/tag";
import { useTagPageViewModel } from "./useTagPageViewModel";
import { capitalize } from "~/lib/stringUtils";
import styles from "./styles.module.css";

export default component$(() => {
    const {
        formTags,
        effectTagsWithAvailability,
        onFormTagHover,
        showInfoForTag,
        selectedFormTagId,
        rarityLevel,
        toolName,
        formatedCostInfoTooltip,
    } = useTagPageViewModel();
    if (formTags.value === null) {
        return <div>Loading...</div>;
    }

    return (
        <div class={styles.main}>
            <h1 class={styles.title}>Select a form tag</h1>
            <h2 class={styles.subtitle}>
                {capitalize(toolName)} Tools ➡ {rarityLevel}
            </h2>
            <div class={styles.content}>
                <div class={styles.tags}>
                    {formTags.value.map((formTag) => (
                        <div class={styles.tagContainer} key={formTag.id}>
                            <Tag
                                tag={formTag}
                                canBeSelected
                                isSelected={
                                    formTag.id === selectedFormTagId.value
                                }
                                onHover$={(isOver) =>
                                    onFormTagHover(formTag, isOver)
                                }
                            />
                        </div>
                    ))}
                </div>

                <div class={styles.info}>
                    {showInfoForTag.value && (
                        <div class={styles.infoColumn}>
                            <h2 class={styles.tagName}>
                                {showInfoForTag.value.name}
                            </h2>
                            <h3
                                class={styles.cost}
                            >{`Cost: ${formatedCostInfoTooltip}`}</h3>
                            <div
                                class={styles.description}
                                dangerouslySetInnerHTML={
                                    showInfoForTag.value.description
                                }
                            />
                            <div>
                                {showInfoForTag.value.availability.map(
                                    ({ availability, reason }) => (
                                        <h3 key={availability}>
                                            {reason ?? ""}
                                        </h3>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
