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
  const rarityIndex = Number.parseInt(location.params.rarityIndex);
  const tierInfo = useItemTier(rarityIndex);

  const remainedSlots = useSignal(tierInfo.value.tags);
  const isATakeAllTagSelected = useSignal(false);

  const showInfoForTag = useSignal<TagWithAvailability | undefined>(
    undefined
  );

  useTask$(async ({ track }) => {
    track(() => effectTags.value)
    track(() => selectedFormTagId.value)

    const mappedTags = (effectTags.value ?? []).map(async (tag) => {
      const availability = await getTagAvailability$(tag)
      return { ...tag, availability } as TagWithAvailability;
    })

    effectTagsWithAvailability.value = await Promise.all(mappedTags);
  })

  const getTagAvailability$ = $((tag: TagModel) => {
    const status: TagAvailabilityWithReason[] = []

    if (isATakeAllTagSelected.value
      || (!doesTagTakeAllSlots(tag.slotCost)
        && remainedSlots.value < tag.slotCost.value)) {
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

  const onHover = $(
    (tag: TagWithAvailability, isOver: boolean) => {
      if (isOver) {
        showInfoForTag.value = tag;
      } else {
        showInfoForTag.value = undefined;
      }
    }
  );

  return { onHover, effectTagsWithAvailability, formTags, showInfoForTag, selectedFormTagId }

}

