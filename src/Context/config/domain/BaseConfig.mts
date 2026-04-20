import { builtinModules } from 'module';

import { LoaderConfig } from './LoaderConfig.mjs';
import { OutputConfig } from './OutputConfig.mjs';

export const BUILTIN_MODULES: readonly string[] = [
  'electron',
  ...builtinModules,
  ...builtinModules.map((nodeModule) => `node:${nodeModule}`)
];

export abstract class BaseConfig {
  readonly entryPoint: string;
  readonly output: OutputConfig;
  readonly baseConfigEntryPoint?: string;
  readonly loaderConfigs: readonly LoaderConfig[];
  readonly excludedLibraries: readonly string[];

  protected constructor(
    entryPoint: string,
    output: OutputConfig,
    loaderConfigs: LoaderConfig[],
    excludedLibraries: string[],
    baseConfigEntryPoint?: string
  ) {
    this.entryPoint = entryPoint;
    this.output = output;
    this.baseConfigEntryPoint = baseConfigEntryPoint;
    this.excludedLibraries = [...excludedLibraries, ...BUILTIN_MODULES];
    this.loaderConfigs = loaderConfigs;
  }
}
