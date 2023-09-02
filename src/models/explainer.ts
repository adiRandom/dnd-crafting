export type Explainer = {
  id: number;
  title: string;
  text: string;
  toolId: number;
} | {
  id: number;
  title: string;
  text: string;
  tierIndex: number;
}
  | {
    id: number;
    title: string;
    text: string;
  }