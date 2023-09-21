import { Rarity } from "./rarity";


export type ImageModel = {
  id: number;
  formTagId: number;
  formTagName: string;
  url: string;
  rarity: Rarity;
};