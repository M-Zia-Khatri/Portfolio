import { Flex, Spinner } from "@radix-ui/themes";

export function AnalyticsLoading() {
  return (
    <Flex justify="center" p="9">
      <Spinner size="3" />
    </Flex>
  );
}
