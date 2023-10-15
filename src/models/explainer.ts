import { ExplainerTable } from "./explainerTable";
import { ExplainerBlock } from "./explianerBlock";

export type Explainer = {
  id: number;
  title: string;
  /**
   *@Deprecated
   */
  text: string;
  toolId: number;
  table?: ExplainerTable;
  blocks: ExplainerBlock[];
  stage: ExplainerStage
}
  | {
    id: number;
    title: string;
    text: string;
    stage: ExplainerStage,
    blocks: ExplainerBlock[];
  }


export enum ExplainerStage {
  Tool = 0,
  Tier = 1,
  Tags = 2,
}

export function isExplainerWithTool(explainer: Explainer): explainer is Explainer & { toolId: number } {
  return explainer.stage !== ExplainerStage.Tool
}

export function explainerStageName(stage: ExplainerStage) {
  switch (stage) {
    case ExplainerStage.Tool:
      return "Tool"
    case ExplainerStage.Tier:
      return "Tier"
    case ExplainerStage.Tags:
      return "Tags"
  }
}