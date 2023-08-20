import { ItemTierInfo } from "~/models/itemTierInfo";
import { Rarity } from "~/models/rarity";
import { TagModel, TagType } from "~/models/tags";

const ITEM_TIERS: Record<Rarity, ItemTierInfo> = {
  [Rarity.Common]: {
    numberOfIp: 2,
    dcMin: 10,
    timeInDays: 1,
    color: 'rgb(51, 51, 51)',
    tags: 2
  },
  [Rarity.Uncommon]: {
    numberOfIp: 4,
    dcMin: 12,
    dcMax: 13,
    timeInDays: 5,
    color: 'rgb(25, 68, 30)',
    tags: 3
  },
  [Rarity.Rare]: {
    numberOfIp: 6,
    dcMin: 14,
    dcMax: 15,
    timeInDays: 10,
    color: 'rgb(22, 38, 82)',
    tags: 4
  },
  [Rarity.VeryRare]: {
    numberOfIp: 8,
    dcMin: 16,
    dcMax: 17,
    timeInDays: 15,
    color: 'rgb(94, 19, 144)',
    tags: 5
  },
  [Rarity.Legendary]: {
    numberOfIp: 10,
    dcMin: 18,
    dcMax: 20,
    timeInDays: 20,
    color: 'rgb(208, 147, 33)',
    tags: 6
  }
}

const TAGS: TagModel[] = [
  // FormTags
  {
    id: 1,
    name: "FormTag1",
    type: TagType.FormTag,
    minRarity: Rarity.Common,
    slotCost: { value: 2 },
    slotRequirementId: [],
    description: "A generic FormTag1."
  },
  {
    id: 2,
    name: "FormTag2",
    type: TagType.FormTag,
    minRarity: Rarity.Uncommon,
    slotCost: { value: 4 },
    slotRequirementId: [],
    description: "A special FormTag2."
  },
  {
    id: 3,
    name: "FormTag3",
    type: TagType.FormTag,
    minRarity: Rarity.VeryRare,
    slotCost: { value: 5 },
    slotRequirementId: [],
    description: "A unique FormTag3."
  },

  // EffectTags with Requirements
  {
    id: 4,
    name: "EffectTag1",
    type: TagType.EffectTag,
    minRarity: Rarity.Rare,
    slotCost: { value: 3 },
    slotRequirementId: [1], // Requires FormTag1
    description: "An effect that works with FormTag1."
  },
  {
    id: 5,
    name: "EffectTag2",
    type: TagType.EffectTag,
    minRarity: Rarity.Legendary,
    slotCost: { takeAll: true },
    slotRequirementId: [1, 2], // Requires FormTag1 and FormTag2
    description: "An ultimate effect that requires both FormTag1 and FormTag2."
  },
  {
    id: 6,
    name: "EffectTag3",
    type: TagType.EffectTag,
    minRarity: Rarity.Uncommon,
    slotCost: { value: 1 },
    slotRequirementId: [3], // Requires FormTag3
    description: "A unique effect that is compatible with FormTag3."
  },

  // EffectTags without Requirements
  {
    id: 7,
    name: "EffectTag4",
    type: TagType.EffectTag,
    minRarity: Rarity.Common,
    slotCost: { value: 2 },
    slotRequirementId: [],
    description: "An effect that doesn't require any form tags."
  },
  {
    id: 8,
    name: "EffectTag5",
    type: TagType.EffectTag,
    minRarity: Rarity.Rare,
    slotCost: { takeAll: true },
    slotRequirementId: [],
    description: "A powerful effect that consumes all available slots."
  },
];



let tierInfo: Record<Rarity, ItemTierInfo> | null = null;
let tags: TagModel[] | null = null;

export async function getTierInfo(): Promise<Record<Rarity, ItemTierInfo>> {
  if (tierInfo === null) {
    tierInfo = ITEM_TIERS
  }

  return Promise.resolve(tierInfo)
}

export async function getTags(/*toolId: number*/): Promise<TagModel[]> {
  if (tags === null) {
    tags = TAGS
  }

  return Promise.resolve(tags)
}