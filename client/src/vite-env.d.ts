/// <reference types="vite/client" />
/// <reference types="vite-imagetools/client" />

declare module "*&as=srcset" {
  const src: string;
  export default src;
}

declare module "*&as=picture" {
  const src: {
    img: { src: string; w: number; h: number };
    sources: Record<string, string>;
  };
  export default src;
}

declare module "*&as=metadata" {
  const out: Record<string, unknown>;
  export default out;
}