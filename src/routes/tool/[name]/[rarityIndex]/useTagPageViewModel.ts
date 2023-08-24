import { useSignal, useTask$, $ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { useItemTier } from "~/hooks/useItemTier";
import { useTags } from "~/hooks/useTags";
import { RARITIES } from "~/models/rarity";
import type { TagAvailabilityWithReason } from "~/models/tagAvailability";
import { TagAvailability } from "~/models/tagAvailability";
import type { TagModel, TagWithAvailability } from "~/models/tags";
import { doesTagTakeAllSlots } from "~/models/tags";

export function useTagPageViewModel() {
  const selectedFormTagId = useSignal<number | null>(null);

  const { formTags, effectTags } = useTags();
  const effectTagsWithAvailability = useSignal<TagWithAvailability[]>([])

  const location = useLocation();
  const toolName = location.params.name;
  const rarityIndex = Number.parseInt(location.params.rarityIndex);
  const tierInfo = useItemTier(rarityIndex);

  const remainedSlots = useSignal(tierInfo.value?.tags);
  const isATakeAllTagSelected = useSignal(false);

  const showInfoForTag = useSignal<TagWithAvailability | undefined>(
    undefined
  );

  const formatedCostInfoTooltip = doesTagTakeAllSlots(showInfoForTag.value?.slotCost ?? { value: 0 }) ?
    "Takes all slots" : (showInfoForTag.value?.slotCost as any)?.value?.toString() ?? "0"


  const getTagAvailability$ = $((tag: TagModel) => {
    const status: TagAvailabilityWithReason[] = []

    if (isATakeAllTagSelected.value
      || (!doesTagTakeAllSlots(tag.slotCost)
        && (remainedSlots.value ?? 0) < tag.slotCost.value)) {
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
      tag.tagRequirementId.find(tagId =>
        selectedFormTagId.value === tagId
      ) === undefined
    ) {
      const requirementsAsString = tag.tagRequirementId.reduce(
        (acc, tagId) =>
          acc +
          (formTags.value?.find(
            (formTag) => formTag.id === tagId
          ) ?? "??") +
          " / ",
        ""
      );
      status.push({
        availability: TagAvailability.FormTagMissing,
        reason: `${TagAvailability.FormTagMissing}: ${requirementsAsString}`
      })
    }

    return status.length > 0
      ? status
      : [{ availability: TagAvailability.Available, reason: undefined }]
  })

  useTask$(async ({ track }) => {
    track(() => effectTags.value)
    track(() => selectedFormTagId.value)

    const mappedTags = (effectTags.value ?? []).map(async (tag) => {
      const availability = await getTagAvailability$(tag)
      return { ...tag, availability } as TagWithAvailability;
    })

    effectTagsWithAvailability.value = await Promise.all(mappedTags);
  })


  const onEffectTagHover = $(
    (tag: TagWithAvailability, isOver: boolean) => {
      if (isOver) {
        showInfoForTag.value = tag;
      } else {
        showInfoForTag.value = undefined;
      }
    }
  );

  const onFormTagHover = $((tag: TagModel, isOver: boolean) => {
    onEffectTagHover(
      {
        ...tag,
        availability: [
          {
            availability:
              TagAvailability.Available,
            reason: undefined,
          },
        ],
      } as TagWithAvailability,
      isOver)
  })


  return {
    onEffectTagHover,
    onFormTagHover,
    effectTagsWithAvailability,
    formTags,
    showInfoForTag,
    selectedFormTagId,
    toolName,
    rarityLevel: RARITIES.find((_, index) => rarityIndex === index)
    , formatedCostInfoTooltip
  }

}

