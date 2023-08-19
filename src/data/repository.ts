import { ItemTierInfo } from "~/models/itemTierInfo";
import { Rarity } from "~/models/rarity";

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

let tierInfo: Record<Rarity, ItemTierInfo> | null = null;

export async function getTierInfo(): Promise<Record<Rarity, ItemTierInfo>> {
  if (tierInfo === null) {
    tierInfo =  ITEM_TIERS
  } 
  
  return Promise.resolve(tierInfo)
}