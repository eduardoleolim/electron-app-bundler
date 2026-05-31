import { ConfigReader } from '../../../src/context/config/domain/ConfigReader.mjs';

export class InMemoryConfigReader extends ConfigReader {
  private config: unknown;

  constructor(config?: unknown) {
    super();
    this.config = config;
  }

  public read(): unknown {
    return this.config;
  }

  public setConfig(config: unknown): void {
    this.config = config;
  }
}
