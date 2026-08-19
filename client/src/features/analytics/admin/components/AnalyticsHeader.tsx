import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import type { AnalyticsRange } from "../analytics.admin.types";
import { AnalyticsFilters } from "./AnalyticsFilters";

export function AnalyticsHeader({
  range,
  onRangeChange,
}: {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
}) {
  return (
    <Flex justify="between" align="center" mb="6">
      <Box>
        <Heading size="8">Analytics</Heading>
        <Text color="gray">
          Privacy-conscious visitor, traffic, content, event, device, and geography reporting.
        </Text>
      </Box>
      <AnalyticsFilters range={range} onRangeChange={onRangeChange} />
    </Flex>
  );
}
