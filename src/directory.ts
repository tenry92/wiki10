import path from 'node:path';
import fs from 'node:fs';

import File from './file';
import logger from './logger';

export default class Directory {
  public readonly files: File[] = [];

  public get unusedFiles() {
    return this.files.filter(file => !file.used);
  }

  public constructor(public readonly sourcePath: string) {}

  public async scan() {
    await this.scanFolder(this.sourcePath);
  }

  public async unlinkUnusedFiles() {
    const pendingPromises: PromiseLike<void>[] = [];

    for (const file of this.unusedFiles) {
      pendingPromises.push((async () => {
        await fs.promises.unlink(file.filePath);
        logger.verbose(`deleted unused file ${file.filePath}`);
      })());
    }

    return pendingPromises;
  }

  public hasFileWithBasename(basename: string) {
    return this.files.some(file => file.baseName == basename);
  }

  public getFilesWithBasename(basename: string) {
    return this.files.filter(file => file.baseName == basename);
  }

  public getFileByPath(path: string): File | undefined {
    return this.files.filter(file => file.filePath == path)[0];
  }

  public async syncTo(target: Directory, exclude?: RegExp) {
    for (const layoutFile of this.files) {
      if (exclude && exclude.test(layoutFile.filePath)) {
        continue;
      }

      const relativePath = path.relative(this.sourcePath, layoutFile.filePath);
      const outputPath = path.resolve(target.sourcePath, relativePath);
      const outputFile = target.getFileByPath(outputPath);

      const pendingPromises: PromiseLike<void>[] = [];

      if (outputFile) {
        outputFile.used = true;
      }

      if (!outputFile || outputFile.stats.mtimeMs < layoutFile.stats.mtimeMs) {
        logger.debug(`copying ${layoutFile.filePath} to ${outputPath}`);
        await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
        pendingPromises.push(fs.promises.copyFile(layoutFile.filePath, outputPath));
        
        if (outputFile) {
          outputFile.used = true;
        }
      }

      await Promise.all(pendingPromises);
    }

    await target.unlinkUnusedFiles();
  }

  private async scanFolder(folder: string) {
    const filenames = await fs.promises.readdir(folder);

    for (const filename of filenames) {
      const filePath = path.resolve(folder, filename);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        await this.scanFolder(filePath);
        continue;
      }

      if (!stats.isFile()) {
        logger.debug(`${filename} is not a file; skip`);
        continue;
      }

      logger.verbose(`adding ${filename} to the directory`);
      this.files.push(new File(filePath, stats));
    }
  }
}
