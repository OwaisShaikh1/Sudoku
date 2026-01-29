/**
 * Configuration for Owais solver
 * Allows passing options like strategy flags to the solver
 */

export interface OwaissConfig {
  usePointingPairs?: boolean;
  useNakedPairs?: boolean;
  useHiddenPairs?: boolean;
}

let config: OwaissConfig = {
  usePointingPairs: false,
  useNakedPairs: false,
  useHiddenPairs: false
};

export function setOwaisConfig(newConfig: Partial<OwaissConfig>): void {
  config = { ...config, ...newConfig };
}

export function getOwaisConfig(): OwaissConfig {
  return config;
}

export function resetOwaisConfig(): void {
  config = {
    usePointingPairs: false,
    useNakedPairs: false,
    useHiddenPairs: false
  };
}
