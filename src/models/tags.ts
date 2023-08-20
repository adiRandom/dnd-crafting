import type { Rarity } from "./rarity";

export type TagModel = {
  id: number;
  name: string;
  type: TagType;
  minRarity: Rarity;
  slotCost: SlotCost;
  slotRequirementId: number[];
  description: string;
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

export function doesSlotCostTakeAll(slotCost: SlotCost): slotCost is { takeAll: true } {
  return 'takeAll' in slotCost;
}