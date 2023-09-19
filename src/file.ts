import path from 'node:path';
import fs from 'node:fs';

export default class File {
  public readonly baseName: string;

  /**
   * E.g. '.md'
   */
  public readonly extension: string;

  public used = false;

  public constructor(public readonly filePath: string, public readonly stats: fs.Stats) {
    const parsedPath = path.parse(filePath);

    this.baseName = parsedPath.name;
    this.extension = parsedPath.ext;
  }
}
