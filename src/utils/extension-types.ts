export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };
export type JsonObject = Record<string, unknown>;

export interface ContributionConfig {
  entryPoint?: string;
  title?: string;
  host?: string;
  handles?: string[];
  [key: string]: unknown;
}

export interface AhaExtensionConfig {
  jsxFactory?: string;
  contributes: Record<string, Record<string, ContributionConfig>>;
  [key: string]: unknown;
}

export interface PackageConfiguration {
  name: string;
  version: string;
  description: string;
  author: string;
  repository?: string | { url: string };
  ahaExtension: AhaExtensionConfig;
  [key: string]: unknown;
}
