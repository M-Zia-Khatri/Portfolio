import { useState } from "react";

const TIMELINE_PAGE_SIZE = 30;

export function useAnalyticsPagination() {
  const [timelineLimit, setTimelineLimit] = useState(TIMELINE_PAGE_SIZE);
  return { timelineLimit, setTimelineLimit, TIMELINE_PAGE_SIZE };
}
