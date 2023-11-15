import { SimpleData } from "./simple-data";

export interface ChartDescription {
  class: string;
  title: string;
  showTitle: boolean;
  legend: boolean;
  colors: Array<string>;
  data: Array<SimpleData>;
}
