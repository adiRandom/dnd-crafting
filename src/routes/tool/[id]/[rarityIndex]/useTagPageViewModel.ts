import { useSignal, useTask$, $, useComputed$, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import html2canvas from "html2canvas";
import { useIconItem } from "~/hooks/useItemIcon";
import { RARITIES } from "~/models/rarity";
import type { TagAvailabilityWithReason } from "~/models/tagAvailability";
import { TagAvailability } from "~/models/tagAvailability";
import type { TagModel, TagWithAvailability } from "~/models/tags";
import { doesTagTakeAllSlots, isTagAvailable } from "~/models/tags";
import { useBaseSummon, useTags, useTierInfo, useTool } from ".";
import { SummonModel } from "~/models/summonModel";

export function useTagPageViewModel() {
  const selectedFormTag = useSignal<TagModel | null>(null);

  const tags = useTags();
  const formTagsWithAvailability = useSignal<TagWithAvailability[]>([])
  const effectTagsWithAvailability = useSignal<TagWithAvailability[]>([])

  const location = useLocation();
  const tool = useTool();
  const toolName = useComputed$(() => tool.value?.name)
  const rarityIndex = Number.parseInt(location.params.rarityIndex);
  const tierInfo = useTierInfo();

  const remainingSlots = useSignal(tierInfo.value?.tags);
  const isATakeAllTagSelected = useSignal(false);

  const selectedEffectTagIds = useSignal<Record<number, boolean>>({});

  const baseSummon = useBaseSummon()

  const showItemCard = useSignal(false);
  const iconUrl = useIconItem(selectedFormTag, rarityIndex);

  const summon = useSignal(null as SummonModel | null)

  useTask$(async ({ track }) => {
    track(() => tierInfo.value)
    remainingSlots.value = tierInfo.value?.tags
  })

  // Compute the summon
  useTask$(async ({ track }) => {
    track(() => [baseSummon.value, selectedEffectTagIds.value])

    if (baseSummon.value === null) {
      return
    }

    let bonusAc = 0
    let bonusSpd = 0

    const selectedEffectTags = Object.keys(selectedEffectTagIds.value).map(key => Number.parseInt(key))
    selectedEffectTags.forEach(id => {
      const tag = tags.value.effectTags.find(tag => tag.id === id)

      if (tag?.summonBonus.ac) {
        bonusAc += tag.summonBonus.ac
      }

      if (tag?.summonBonus.spd) {
        bonusSpd += tag.summonBonus.spd
      }
    })

    const newSummon = {
      ...baseSummon.value,
      stats: {
        ...baseSummon.value.stats,
        ac: baseSummon.value.stats.ac + bonusAc,
        spd: baseSummon.value.stats.spd + bonusSpd
      }
    } as SummonModel

    summon.value = newSummon
  })

  const calculatedRemainingSlots = useComputed$(() => {
    if (isATakeAllTagSelected.value) {
      return 0;
    } else {
      return remainingSlots.value;
    }
  })


  const tagsToShow = useComputed$(() => {
    if (selectedFormTag.value) {
      return effectTagsWithAvailability.value
    } else {
      return formTagsWithAvailability.value
    }
  })


  const showInfoForTag = useSignal<TagWithAvailability | undefined>(
    undefined
  );


  const formatedCostInfoTooltip = useComputed$(() =>
    doesTagTakeAllSlots(showInfoForTag.value?.slotCost ?? { value: 0 })
      ? "Takes all slots"
      : (showInfoForTag.value?.slotCost as any)
        ?.value?.toString() ?? "0"
  )


  const getTagAvailability$ = $((tag: TagModel) => {

    if (selectedEffectTagIds.value[tag.id]) {
      return [{
        availability: TagAvailability.Available,
        reason: undefined
      }]
    }

    const status: TagAvailabilityWithReason[] = []

    const hasAvailableSlots = !doesTagTakeAllSlots(tag.slotCost)
      && (remainingSlots.value ?? 0) >= tag.slotCost.value
    const hasAvailableSlotsForATakeAllTag = doesTagTakeAllSlots(tag.slotCost) && remainingSlots.value !== 0

    if (isATakeAllTagSelected.value
      || (!hasAvailableSlotsForATakeAllTag && !hasAvailableSlots)
    ) {
      status.push(
        {
          availability: TagAvailability.NotEnoughSlots,
          reason: TagAvailability.NotEnoughSlots
        }
      )
    }

    if (rarityIndex < RARITIES.findIndex(rarity =>
      rarity === tag.minRarity
    )) {
      status.push(
        {
          availability: TagAvailability.MiniumRarity,
          reason: `${TagAvailability.MiniumRarity}: ${tag.minRarity}`
        })
    }


    if (
      tag.tagRequirementId.length !== 0 && tag.tagRequirementId.find(tagId =>
        selectedFormTag.value?.id === tagId
      ) === undefined
    ) {

      const requirementsAsString = tag.tagRequirementId.reduce(
        (acc, tagId) =>
          acc +
          (tags.value.formTags.find(
            (formTag) => formTag.id === tagId
          )?.name ?? "??") +
          " / ",
        ""
      );

      const trimmedRequirements = requirementsAsString.substring(
        0,
        requirementsAsString.length - 3
      );

      status.push({
        availability: TagAvailability.FormTagMissing,
        reason: `${TagAvailability.FormTagMissing}: ${trimmedRequirements}`
      })
    }

    const mutuallyExclusiveSelectedTags = tag.mutuallyExclusiveTagId.filter(tagId => {
      return selectedEffectTagIds.value[tagId]
    })

    if (mutuallyExclusiveSelectedTags.length > 0) {
      const mutuallyExclusiveTagsAsString = mutuallyExclusiveSelectedTags.reduce(
        (acc, tagId) =>
          acc +
          (tags.value.effectTags.find(
            (effectTag) => effectTag.id === tagId
          )?.name ?? "??") +
          " / ",
        ""
      );

      const trimmedMutuallyExclusiveTags = mutuallyExclusiveTagsAsString.substring(
        0,
        mutuallyExclusiveTagsAsString.length - 3
      );

      status.push({
        availability: TagAvailability.MutuallyExclusiveEffects,
        reason: `${TagAvailability.MutuallyExclusiveEffects}: ${trimmedMutuallyExclusiveTags}`
      })
    }


    return status.length > 0
      ? status
      : [{ availability: TagAvailability.Available, reason: undefined }]
  })

  useTask$(async ({ track }) => {
    track(() => [tags.value.effectTags, selectedFormTag.value, selectedEffectTagIds.value])

    const mappedTags = (tags.value.effectTags).map(async (tag) => {
      const availability = await getTagAvailability$(tag)
      return { ...tag, availability } as TagWithAvailability;
    })

    effectTagsWithAvailability.value = await Promise.all(mappedTags);
  })


  useVisibleTask$(async ({ track }) => {
    track(() => [tags.value.formTags])

    console.log("Calculating availability", tags.value.formTags)

    const mappedTags = (tags.value.formTags).map(async (tag) => {
      const availability = await getTagAvailability$(tag)
      return { ...tag, availability } as TagWithAvailability;
    })

    formTagsWithAvailability.value = await Promise.all(mappedTags);
  })


  const onHover = $((tag: TagWithAvailability, isOver: boolean) => {
    if (isOver) {
      showInfoForTag.value = tag;
    } else {
      showInfoForTag.value = undefined;
    }
  })

  const onFormTagClick = $((tag: TagWithAvailability) => {
    if (!isTagAvailable(tag, false)) {
      return
    }

    selectedFormTag.value = tag;

    if (remainingSlots.value === undefined) {
      return
    }

    if (
      !doesTagTakeAllSlots(tag.slotCost)
    ) {
      remainingSlots.value =
        remainingSlots.value - tag.slotCost.value;
    } else {
      remainingSlots.value = 0;
    }
  })

  const onEffectTagClick = $((tag: TagWithAvailability) => {
    const isTagSelected = selectedEffectTagIds.value[tag.id]
    if (!isTagAvailable(tag, isTagSelected)) {
      return
    }

    const newSelectedEffectTagIds = { ...selectedEffectTagIds.value }

    if (isTagSelected) {
      delete newSelectedEffectTagIds[tag.id];

      if (doesTagTakeAllSlots(tag.slotCost)) {
        isATakeAllTagSelected.value = false;
      }
      else {
        remainingSlots.value =
          (remainingSlots.value ?? 0) + tag.slotCost.value;
      }
    } else {
      newSelectedEffectTagIds[tag.id] = true;

      if (doesTagTakeAllSlots(tag.slotCost)) {
        isATakeAllTagSelected.value = true;
      }
      else {
        remainingSlots.value =
          (remainingSlots.value ?? 0) - tag.slotCost.value;
      }
    }

    selectedEffectTagIds.value = newSelectedEffectTagIds;
  })

  const onTagClick = $((tag: TagWithAvailability) => {
    if (selectedFormTag.value) {
      onEffectTagClick(tag)
    } else {
      onFormTagClick(tag)
    }
  })

  const onClearFormTagClick = $(() => {
    selectedFormTag.value = null;
    remainingSlots.value = tierInfo.value?.tags;
  })


  const onContinueClick = $(() => {
    showItemCard.value = true;
  })

  const print = $(() => {
    // Get the html from the item card element
    // Use html2canvas to convert the html to an image
    // Open a new window with the image

    html2canvas(document.getElementById(summon.value != null ? "item-and-summon" : "item-card") as HTMLElement,
      { allowTaint: true, useCORS: true }
    ).then(canvas => {
      const dataURL = canvas.toDataURL("image/png");
      const newWindow = window.open();
      newWindow?.document.write(`<img src="${dataURL}" />`);
      newWindow?.print();
    })
  })


  return {
    onHover,
    tagsToShow,
    showInfoForTag,
    selectedFormTag,
    toolName,
    rarityLevel: RARITIES.find((_, index) => rarityIndex === index)
    , formatedCostInfoTooltip,
    remainingSlots: calculatedRemainingSlots,
    allSlots: tierInfo.value?.tags,
    onTagClick,
    selectedEffectTagIds,
    showItemCard,
    iconUrl,
    onContinueClick,
    print,
    onClearFormTagClick,
    summon
  }
}

