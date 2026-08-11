import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { AppRouter } from "./routes/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 7.5, // 7.5 min
      gcTime: 1000 * 60 * 15, // 15 min
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme
        appearance="dark"
        accentColor="blue"
        grayColor="gray"
        radius="small"
        scaling="100%"
        className="bg-(--color-background)"
      >
        <RouterProvider router={AppRouter} />
      </Theme>
    </QueryClientProvider>
  );
}
