import { ChartDescription } from "./chart-description";

export interface ChartData {
  title: string;
  image: string;
  value: number;
  charts: Array<ChartDescription> | null;
}
