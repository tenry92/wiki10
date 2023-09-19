import fs from 'node:fs';

import './dispose-polyfill';

export default class TempFile implements AsyncDisposable {
  public constructor(public readonly path: string) {}

  async [Symbol.asyncDispose]() {
    await fs.promises.unlink(this.path);
  }
}
