export type Explainer = {
  id: number;
  title: string;
  text: string;
  toolId: number;
  stage: ExplainerStage
} | {
  id: number;
  title: string;
  text: string;
  tierIndex: number;
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