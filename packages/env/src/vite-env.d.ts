// `vite/client` is not resolvable here (vite is only a dependency of apps/web),
// so these are declared directly. The `export {}` makes this a module, which is
// what lets `declare global` augment `ImportMeta` explicitly.

export {};

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  readonly [key: string]: string | number | boolean | undefined;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
