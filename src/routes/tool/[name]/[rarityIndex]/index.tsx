import { component$ } from "@builder.io/qwik";
import Tag from "~/components/tag/tag";
import { useTagPageViewModel } from "./useTagPageViewModel";
import { capitalize } from "~/lib/stringUtils";
import styles from "./styles.module.css";
import SearchIcon from "~/components/ui/icons/search";
import { ICON } from "~/theme/color";
import { isTagAvailable } from "~/models/tags";
import useIntroModal from "~/hooks/useIntroModal";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import ItemBlock from "~/components/block/ItemBlock";

export default component$(() => {
    const {
        tagsToShow,
        onHover,
        showInfoForTag,
        selectedFormTag,
        rarityLevel,
        toolName,
        formatedCostInfoTooltip,
        remainingSlots,
        allSlots,
        onTagClick,
        selectedEffectTagIds,
        showItemCard,
        iconUrl,
        onContinueClick,
        print,
    } = useTagPageViewModel();

    useIntroModal({
        title: `${capitalize(toolName)} Tool Rules`,
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
        button: "Start Crafting",
    });

    if (tagsToShow.value.length === 0) {
        return <div>Loading...</div>;
    }

    if (showItemCard.value && rarityLevel && selectedFormTag.value) {
        return (
            <div>
                <ItemBlock
                    rarity={rarityLevel}
                    formTag={selectedFormTag.value}
                    effectTags={tagsToShow.value.filter(
                        (tag) => selectedEffectTagIds.value[tag.id]
                    )}
                    iconUrl={iconUrl.value}
                />
                <PrimaryButton
                    class={[styles.printButton]}
                    label="Print"
                    onClick$={print}
                />
            </div>
        );
    }

    return (
        <div class={styles.main}>
            <h1 class={styles.title}>Select a form tag</h1>
            <h2 class={styles.subtitle}>
                {capitalize(toolName)} Tools ➡ {rarityLevel}
            </h2>
            <h2 class={styles.slots}>
                Slots : {remainingSlots.value} / {allSlots}
            </h2>
            <div
                class={{
                    [styles.selectedTagContainer]: true,
                    [styles.selectedTagContainerWithContent]:
                        selectedFormTag.value !== null,
                }}
            >
                {selectedFormTag.value && (
                    <Tag
                        tag={selectedFormTag.value}
                        canBeSelected
                        isSelected={true}
                        onHover$={() => {}}
                    ></Tag>
                )}
            </div>
            <div class={styles.content}>
                <div class={styles.tags}>
                    {tagsToShow.value.map((tag) => (
                        <div
                            class={styles.tagContainer}
                            onClick$={() => {
                                onTagClick(tag);
                            }}
                            key={tag.id}
                        >
                            <Tag
                                tag={tag}
                                canBeSelected={isTagAvailable(
                                    tag,
                                    selectedEffectTagIds.value[tag.id]
                                )}
                                isSelected={selectedEffectTagIds.value[tag.id]}
                                onHover$={(isOver) => onHover(tag, isOver)}
                            />
                        </div>
                    ))}
                </div>

                <div class={styles.info}>
                    {showInfoForTag.value ? (
                        <div class={styles.infoColumn}>
                            <h2 class={styles.tagName}>
                                {showInfoForTag.value.name}
                            </h2>
                            <h3
                                class={styles.cost}
                            >{`Cost: ${formatedCostInfoTooltip.value}`}</h3>
                            <div
                                class={styles.description}
                                dangerouslySetInnerHTML={
                                    showInfoForTag.value.description
                                }
                            />
                            <div class={styles.missingContainer}>
                                {showInfoForTag.value.availability.map(
                                    ({ availability, reason }) => (
                                        <h3
                                            class={styles.missing}
                                            key={availability}
                                        >
                                            {reason ?? ""}
                                        </h3>
                                    )
                                )}
                            </div>
                        </div>
                    ) : (
                        <div
                            class={[
                                styles.infoColumn,
                                styles.infoColumnEmptyState,
                            ]}
                        >
                            <SearchIcon
                                class={styles.emptyStateIcon}
                                color={ICON}
                            />
                            <h2 class={styles.tagName}>
                                Hover over a tag to see the details
                            </h2>
                        </div>
                    )}
                </div>
            </div>
            {selectedFormTag.value && (
                <PrimaryButton
                    class={[styles.finishButton]}
                    label="Finish"
                    onClick$={onContinueClick}
                />
            )}
        </div>
    );
});
