import { ExplainerTable } from "./explainerTable";

export type ExplainerBlock = {
  id: number;
  content: string | ExplainerTable
}