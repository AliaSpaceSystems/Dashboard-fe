import { SimpleData } from "./simple-data";

export interface ChartDescription {
  class: string;
  title: string;
  showTitle: boolean;
  showLegend: boolean;
  showPercentage?: boolean;
  showTotal?: boolean;
  colors: Array<string>;
  data: Array<SimpleData>;
}
