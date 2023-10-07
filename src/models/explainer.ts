import { ExplainerTable } from "./explainerTable";

export type Explainer = {
  id: number;
  title: string;
  text: string;
  toolId: number;
  table?: ExplainerTable;
  stage: ExplainerStage
}
  | {
    id: number;
    title: string;
    text: string;
    stage: ExplainerStage
  }


export enum ExplainerStage {
  Tool = 0,
  Tier = 1,
  Tags = 2,
}

export function isToolExplainer(explainer: Explainer): explainer is Explainer & { toolId: number } {
  return explainer.stage === ExplainerStage.Tier
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