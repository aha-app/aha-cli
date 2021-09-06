export interface ExtensionPackageJson {
  name: string;
  description?: string;
  version?: string;
  author: string;
  repository: Repository;
  license: string;
  ahaExtension?: AhaExtensionConfiguration;
}

export interface Repository {
  url: string;
}

export interface AhaExtensionConfiguration {
  files?: string[];
  cspSources?: string[];
  contributes?: Contributes;
  jsxFactory?: string;
}

export interface Contributes {
  [index: string]: Contributions;
}

export interface Contributions {
  [index: string]: any;
}

export interface Issues {
  title: string;
  entryPoint: string;
}
