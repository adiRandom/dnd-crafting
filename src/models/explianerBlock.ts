import { ExplainerTable } from "./explainerTable";

export type ExplainerBlock = {
  id: number;
  content: string | ExplainerTable
}

export const EXPLAINER_TYPE_TABLE = "table"
export const EXPLAINER_TYPE_TEXT = "text"