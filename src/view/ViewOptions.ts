import { AggregateType } from "./AggregateType.ts";

export type ViewOptions = {
  aggregateType?: AggregateType;
  displayUsecaseName?: boolean;
  title?: string;
}