import { SummonType } from "./summonModel";

export type Tool = {
  id: number;
  name: string;
  emoji?: string;
  summonType: SummonType | null;
}