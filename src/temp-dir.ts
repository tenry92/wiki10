import fs from 'node:fs';

import './dispose-polyfill';

export default class TempDir implements AsyncDisposable {
  public path?: string;
  
  public constructor() {}

  public async create() {
    this.path = await fs.promises.mkdtemp('tmp-');
  }

  async [Symbol.asyncDispose]() {
    if (this.path) {
      await fs.promises.rmdir(this.path);
    }
  }

  public toString() {
    return this.path;
  }
}
