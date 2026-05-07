import type { AppPageProps } from './page';

declare module '@inertiajs/core' {
  interface PageProps extends AppPageProps {
    [key: string]: unknown;
  }
}
