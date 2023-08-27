import { useSignal, useTask$, $, useComputed$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { useItemTier } from "~/hooks/useItemTier";
import { useTags } from "~/hooks/useTags";
import { RARITIES } from "~/models/rarity";
import type { TagAvailabilityWithReason } from "~/models/tagAvailability";
import { TagAvailability } from "~/models/tagAvailability";
import type { TagModel, TagWithAvailability } from "~/models/tags";
import { doesTagTakeAllSlots } from "~/models/tags";

export function useTagPageViewModel() {
  const selectedFormTag = useSignal<TagModel | null>(null);

  const { formTags, effectTags } = useTags();
  const effectTagsWithAvailability = useSignal<TagWithAvailability[]>([])

  const location = useLocation();
  const toolName = location.params.name;
  const rarityIndex = Number.parseInt(location.params.rarityIndex);
  const tierInfo = useItemTier(rarityIndex);

  const remainingSlots = useSignal(tierInfo.value?.tags);
  const isATakeAllTagSelected = useSignal(false);


  useTask$(async ({ track }) => {
    track(() => tierInfo.value)
    remainingSlots.value = tierInfo.value?.tags
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
      return formTags.value?.map((tag) => ({
        ...tag,
        availability: [
          {
            availability:
              TagAvailability.Available,
            reason: undefined,
          },
        ],
      }) as TagWithAvailability) ?? []
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
          (formTags.value?.find(
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


    return status.length > 0
      ? status
      : [{ availability: TagAvailability.Available, reason: undefined }]
  })

  useTask$(async ({ track }) => {
    track(() => effectTags.value)
    track(() => selectedFormTag.value)

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

  const onFormTagHover = $((tag: TagWithAvailability, isOver: boolean) => {
    onEffectTagHover(
      tag,
      isOver
    )
  })

  const onHover = $((tag: TagWithAvailability, isOver: boolean) => {
    if (selectedFormTag.value) {
      onEffectTagHover(tag, isOver)
    } else {
      onFormTagHover(tag, isOver)
    }
  })

  const onFormTagClick = $((tag: TagModel) => {
    selectedFormTag.value = tag;
    if (
      !doesTagTakeAllSlots(tag.slotCost)
      && remainingSlots.value !== undefined
    ) {
      console.log(tag.slotCost)
      remainingSlots.value =
        remainingSlots.value - tag.slotCost.value;
    }
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
    onFormTagClick,
  }
}

