import type { Rarity } from "./rarity";
import { TagAvailability, TagAvailabilityWithReason } from "./tagAvailability";

export type TagModel = {
  id: number;
  name: string;
  type: TagType;
  minRarity: Rarity;
  slotCost: SlotCost;
  tagRequirementId: number[];
  description: string;
}

export type TagWithAvailability = TagModel & {
  availability: TagAvailabilityWithReason[];
}

export enum TagType {
  FormTag,
  EffectTag,
}

export type SlotCost = {
  value: number;
} | {
  takeAll: true;
}

export function doesTagTakeAllSlots(slotCost: SlotCost): slotCost is { takeAll: true } {
  return 'takeAll' in slotCost;
}