import { Rarity } from "./rarity";


export type ItemTierInfo = {
  numberOfIp: number;
  dcMin: number;
  dcMax?: number;
  timeInDays: number;
  color: string;
}

export const ITEM_TIERS: Record<Rarity, ItemTierInfo> = {
  [Rarity.Common]: {
    numberOfIp: 2,
    dcMin: 10,
    timeInDays: 1,
    color: 'green'
  },
  [Rarity.Uncommon]: {
    numberOfIp: 4,
    dcMin: 12,
    dcMax: 13,
    timeInDays: 5,
    color: 'blue'
  },
  [Rarity.Rare]: {
    numberOfIp: 6,
    dcMin: 14,
    dcMax: 15,
    timeInDays: 10,
    color: 'purple'
  },
  [Rarity.VeryRare]: {
    numberOfIp: 8,
    dcMin: 16,
    dcMax: 17,
    timeInDays: 15,
    color: 'orange'
  },
  [Rarity.Legendary]: {
    numberOfIp: 10,
    dcMin: 18,
    dcMax: 20,
    timeInDays: 20,
    color: 'red'
  }
}
