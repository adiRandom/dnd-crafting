import { TagType, isTagAvailable } from "~/models/tags";
import {
    getExplainerForTagStage,
    getSummon,
    getTags,
    getTierInfoForRarity,
    getTool,
} from "~/server/repository";
import { routeLoader$ } from "@builder.io/qwik-city";
import { ModalModel } from "~/models/ModalModel";
import { component$ } from "@builder.io/qwik";
import ItemBlock from "~/components/block/ItemBlock";
import Tag from "~/components/tag/tag";
import { PrimaryButton } from "~/components/ui/buttons/primaryButton";
import SearchIcon from "~/components/ui/icons/search";
import useIntroModal from "~/hooks/useIntroModal";
import { capitalize } from "~/lib/stringUtils";
import { ICON } from "~/theme/color";
import { useTagPageViewModel } from "./useTagPageViewModel";
import styles from "./styles.module.css";
import { RARITIES } from "~/models/rarity";
import StatBlock from "~/components/block/StatBlock";


export const useTags = routeLoader$(async (ev) => {
    const toolId = ev.params.id;
    const tags = await getTags(parseInt(toolId));
    return {
        formTags: tags.filter((tag) => tag.type === TagType.FormTag),
        effectTags: tags.filter((tag) => tag.type === TagType.EffectTag),
    };
});

export const useTool = routeLoader$(async (ev) => {
    const toolId = ev.params.id;
    return await getTool(parseInt(toolId));
});

export const useTierInfo = routeLoader$(async (ev) => {
    const tierIndex = ev.params.rarityIndex;
    return await getTierInfoForRarity(parseInt(tierIndex));
});

export const useBaseSummon = routeLoader$(async (ev) => {
    const toolId = ev.params.id;
    const tierIndex = ev.params.rarityIndex;

    const tool = await getTool(parseInt(toolId));
    if (!tool?.summonType) {
        return null;
    }

    const summon = await getSummon(
        tool?.summonType,
        RARITIES[parseInt(tierIndex)]
    );

    return summon;
});

export const useExplainModal = routeLoader$(async (ev) => {
    const toolId = ev.params.id;

    const explainer = await getExplainerForTagStage(parseInt(toolId));
    console.log(explainer);

    return explainer
        ? ({
              title: explainer.title,
              blocks: explainer.blocks.map((block) => ({
                  id: block.id,
                  content: block.content,
              })),
              button: "Add Tags",
          } as ModalModel)
        : ({
              title: `Tag Rules`,
              blocks: [
                  {
                      id: 0,
                      content:
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis ultricies nisl nunc eget nisl. Nulla facilisi. Nulla facilisi. \n\n",
                  },
              ],
              button: "Add Tags",
          } as ModalModel);
});

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
        onClearFormTagClick,
        summon,
    } = useTagPageViewModel();

    const explainer = useExplainModal();

    useIntroModal(explainer.value);

    if (tagsToShow.value.length === 0) {
        return <div class={styles.loading}>Loading...</div>;
    }

    if (showItemCard.value && rarityLevel && selectedFormTag.value) {
        return (
            <div class={styles.finalDiv} id="item-and-summon">
                <ItemBlock
                    rarity={rarityLevel}
                    formTag={selectedFormTag.value}
                    effectTags={tagsToShow.value.filter(
                        (tag) => selectedEffectTagIds.value[tag.id]
                    )}
                    iconUrl={iconUrl.value}
                />
                {summon.value && (
                    <StatBlock
                        name={summon.value.name}
                        stats={summon.value.stats}
                        type={summon.value.creatureType}
                        AC={summon.value.stats.ac}
                        HP={summon.value.stats.hp}
                        speed={summon.value.stats.spd.toString()}
                        abilities={tagsToShow.value
                            .filter((tag) => selectedEffectTagIds.value[tag.id])
                            .map((tag) => ({
                                title: tag.name,
                                description: tag.description,
                            }))}
                    />
                )}
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
                {capitalize(toolName.value ?? "")} Tools ➡ {rarityLevel}
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
                onClick$={onClearFormTagClick}
            >
                {selectedFormTag.value && (
                    <>
                        <Tag
                            tag={selectedFormTag.value}
                            canBeSelected
                            isSelected={true}
                            onHover$={() => {}}
                        ></Tag>
                    </>
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
                                dangerouslySetInnerHTML={(
                                    window as any
                                )?.marked.parse(
                                    showInfoForTag.value.description
                                )}
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
