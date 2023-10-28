import { Rarity } from "./rarity";

export type SummonModel = {
  id: number;
  name: string;
  rarity: Rarity;
  stats: SummonStats;
  type: SummonType;
  creatureType: string;
  atk: string;
}

export type SummonStats = {
  hp: number;
  ac: number;
  spd: number;
  con: number;
  wis: number;
  int: number;
  cha: number;
  str: number;
  dex: number;
}

export type SummonType = "ceramic" | "porcelaine";

export const CERAMIC_TYPE = "ceramic";
export const PORCELAINE_TYPE = "porcelaine";