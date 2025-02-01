/// <reference types="vite/client" />

declare module '*.colors.json' {
  const value: Record<string, string>;
  export default value;
}
