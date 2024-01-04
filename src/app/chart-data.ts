import { ChartDescription } from "./chart-description";

export interface ChartData {
  title: string;
  image: string | undefined;
  value: number | undefined;
  charts: Array<ChartDescription> | null;
}
