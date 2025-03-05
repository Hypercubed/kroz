/// <reference types="vite/client" />

declare module '*.colors.json' {
  const value: Record<string, string>;
  export default value;
}

declare module '*.map.toml' {
  const value: { DF: string; PF: string; ST: string } & {
    [key: string]: string;
  };
  export default value;
}
