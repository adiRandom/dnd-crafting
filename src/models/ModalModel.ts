import { ExplainerTable } from "./explainerTable";

export type ModalModel = {
  title: string;
  content: string;
  button: string;
  explainerTable?: ExplainerTable
};