export interface StringFlagConfig {
  type: 'string';
  char?: string;
  description?: string;
  default?: string;
  required?: boolean;
}

export interface BooleanFlagConfig {
  type: 'boolean';
  char?: string;
  description?: string;
  default?: boolean;
}

export type FlagDefinition = StringFlagConfig | BooleanFlagConfig;

export const Flags = {
  string(config: Omit<StringFlagConfig, 'type'> = {}): StringFlagConfig {
    return { ...config, type: 'string' };
  },
  boolean(config: Omit<BooleanFlagConfig, 'type'> = {}): BooleanFlagConfig {
    return { ...config, type: 'boolean' };
  },
};
