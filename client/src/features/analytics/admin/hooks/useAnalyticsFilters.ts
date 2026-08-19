import { useState } from "react";
import type { AnalyticsRange } from "../analytics.admin.types";

export function useAnalyticsFilters() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  return { range, setRange };
}
