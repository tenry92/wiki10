import path from 'node:path';
import fs from 'node:fs';

import ejs from 'ejs';

import Directory from './directory';
import Directories from './directories';
import Page from './page';
import logger from './logger';
import FenceRenderer from './fence-renderer';
import PageRenderer from './page-renderer';
import packageInfo from './package-info';

import plantumlFenceRenderer from './fence-renderers/plantuml-fence-renderer';
import mermaidFenceRenderer from './fence-renderers/mermaid-fence-renderer';
import chartjsFenceRenderer from './fence-renderers/chartjs-fence-renderer';
import lilypondFenceRenderer from './fence-renderers/lilypond-fence-renderer';
import filetreeFenceRenderer from './fence-renderers/filetree-fence-renderer';
import imageFenceRenderer from './fence-renderers/image-fence-renderer';

interface PageCacheData {
  title: string;
  filename: string;
}

/**
 * The main class that is responsible for building the files.
 */
export default class Builder {
  /**
   * Force building all pages.
   */
  public forceBuildPages = false;

  /**
   * Force building assets of modified pages.
   */
  public forceBuildAssets = false;

  public readonly sourcePath: string;

  public readonly publicPath: string;

  public readonly publicAssetsPath: string;

  public readonly publicCachePath: string;

  public readonly publicMediaPath: string;

  public readonly publicPagesPath: string;

  private directories: Partial<Directories> = {};

  private pages: Page[] = [];

  private fenceRenderers: {[format: string]: FenceRenderer} = {};

  public constructor(public readonly projectPath: string) {
    this.sourcePath = path.resolve(projectPath, 'source');
    this.publicPath = path.resolve(projectPath, 'public');
    this.publicAssetsPath = path.resolve(this.publicPath, 'assets');
    this.publicCachePath = path.resolve(this.publicPath, 'cache');
    this.publicMediaPath = path.resolve(this.publicPath, 'media');
    this.publicPagesPath = path.resolve(this.publicPath, 'pages');

    this.fenceRenderers['plantuml'] = plantumlFenceRenderer;
    this.fenceRenderers['mermaid'] = mermaidFenceRenderer;
    this.fenceRenderers['chartjs'] = chartjsFenceRenderer;
    this.fenceRenderers['lilypond'] = lilypondFenceRenderer;
    this.fenceRenderers['filetree'] = filetreeFenceRenderer;
    this.fenceRenderers['{image}'] = imageFenceRenderer;
  }

  public async build() {
    logger.info(`building ${this.projectPath}`);

    await this.checkPaths();
    await this.makePublicFolders();
    await this.scanFolders();
    await this.syncFolders();

    await this.directories.publicPagesDirectory?.unlinkUnusedFiles();

    await this.renderModifiedPages();
    await this.writePagesList();
  }

  private getPageOutputFilePath(page: Page) {
    const relativePath = path.relative(path.resolve(this.sourcePath, 'pages'), page.file.filePath);

    return path.resolve(this.publicPagesPath, `${relativePath.replace(/\.md/, '.html')}`);
  }

  private async checkPaths() {
    try {
      const stats = await fs.promises.stat(this.sourcePath);

      if (!stats.isDirectory()) {
        console.error(`Missing folder ${this.sourcePath}`);
        process.exit(1);
      }
    } catch {
      console.error(`Missing folder ${this.sourcePath}`);
      process.exit(1);
    }
  }

  private async makePublicFolders() {
    for (const path of [this.publicAssetsPath, this.publicCachePath, this.publicMediaPath, this.publicPagesPath]) {
      await fs.promises.mkdir(path, { recursive: true });
    }
  }

  private async scanFolders() {
    this.directories.sourceLayoutDirectory = new Directory(path.resolve(this.sourcePath, 'layout'));
    this.directories.sourcePagesDirectory = new Directory(path.resolve(this.sourcePath, 'pages'));
    this.directories.sourceMediaDirectory = new Directory(path.resolve(this.sourcePath, 'media'));
    this.directories.publicPagesDirectory = new Directory(this.publicPagesPath);
    this.directories.publicMediaDirectory = new Directory(this.publicMediaPath);
    this.directories.publicCacheDirectory = new Directory(this.publicCachePath);
    this.directories.publicAssetsDirectory = new Directory(path.resolve(this.publicPath, 'assets'));

    const scanPromises: PromiseLike<void>[] = [];

    for (const directory of Object.values(this.directories)) {
      scanPromises.push(directory.scan());
    }

    await Promise.all(scanPromises);

    for (const sourceFile of this.directories.sourcePagesDirectory.files) {
      const relativeUrl = path.relative(this.directories.sourcePagesDirectory.sourcePath, sourceFile.filePath);
      const page = new Page(relativeUrl, sourceFile);
      page.modified = true;
      this.pages.push(page);

      const outputPath = this.getPageOutputFilePath(page);
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      const outputFile = this.directories.publicPagesDirectory.getFileByPath(outputPath);

      if (outputFile) {
        outputFile.used = true;

        if (!(page.namespace == 'Meta') && sourceFile.stats.mtimeMs <= outputFile.stats.mtimeMs && !this.forceBuildPages) {
          page.modified = false;
        }
      }
    }
  }

  private async syncFolders() {
    this.directories.sourceLayoutDirectory!.syncTo(this.directories.publicAssetsDirectory!, /\/layout\.html$/);
    this.directories.sourceMediaDirectory!.syncTo(this.directories.publicMediaDirectory!);
  }

  private async renderModifiedPages() {
    logger.debug(`reading layout template from ${path.resolve(this.sourcePath, 'layout/layout.html')}`);
    const layoutTemplate = await fs.promises.readFile(path.resolve(this.sourcePath, 'layout/layout.html'), 'utf-8');

    const pageRenderer = new PageRenderer();

    for (const [format, fenceRenderer] of Object.entries(this.fenceRenderers)) {
      pageRenderer.addFenceRenderer(format, fenceRenderer);
    }

    for (const page of this.pages.filter(page => page.modified)) {
      logger.debug(`rendering ${page.title}`);

      const outputFilePath = this.getPageOutputFilePath(page);
      const pagesUrl = `${'../'.repeat(page.level - 1)}`;
      const assetsUrl = `${'../'.repeat(page.level)}assets/`;
      const cacheUrl = `${'../'.repeat(page.level)}cache/`;

      const output = await pageRenderer.render(page, {
        assets: assetsUrl,
        cache: cacheUrl,
        pages: this.pages,
        pagesUrl,
      });

      const render = ejs.render(layoutTemplate, {
        title: page.title,
        content: output.html,
        assets: assetsUrl,
        cache: cacheUrl,
        menuItems: [
          {
            label: 'Main page',
            link: `${pagesUrl}Main_Page.html`,
            active: page.url == 'Main_Page.md',
          },
          {
            label: 'Special pages',
            link: `${pagesUrl}Meta/Special_Pages.html`,
            active: page.url == 'Meta/Special_Pages.md',
          },
          {
            label: 'Markup',
            link: `${pagesUrl}Meta/Markup.html`,
            active: page.url == 'Meta/Markup.md',
          },
        ],
        footerItems: [
          `Generated with ${packageInfo.name} ${packageInfo.version} on ${new Date().toString().substring(0, 21)}`,
          `This page was last modified on ${page.file.stats.mtime.toString().substring(0, 21)}`,
        ],
      });

      logger.debug(`writing ${outputFilePath}`);
      await fs.promises.writeFile(outputFilePath, render);
      logger.info(`written ${outputFilePath}`);

      const pageCachePath = path.resolve(this.publicCachePath, page.file.baseName);
      await fs.promises.mkdir(pageCachePath, { recursive: true });
      const pageCacheDirectory = new Directory(pageCachePath);
      await pageCacheDirectory.scan();

      await fs.promises.mkdir(pageCachePath, { recursive: true });

      for (const [basename, { format, info, source }] of Object.entries(output.generatedAssets)) {
        const fenceRenderer = this.fenceRenderers[format];

        if (!fenceRenderer?.generateAssets) {
          continue;
        }

        const generatedFiles = pageCacheDirectory.getFilesWithBasename(basename);

        generatedFiles.forEach(file => file.used = true);

        if (generatedFiles.length == 0 || this.forceBuildAssets) {
          await fenceRenderer.generateAssets(info, source, path.resolve(pageCachePath, basename));
        }
      }

      await pageCacheDirectory.unlinkUnusedFiles();
    }
  }

  private async writePagesList() {
    const jsonData: PageCacheData[] = [];

    for (const page of this.pages) {
      jsonData.push({
        title: page.title,
        filename: page.url.replace(/\.md$/, '.html'),
      });

      for (const alias of page.aliases) {
        jsonData.push({
          title: alias,
          filename: page.url.replace(/\.md$/, '.html'),
        });
      }
    }

    const outputFilename = path.resolve(this.directories.publicCacheDirectory!.sourcePath, 'pages.js');
    await fs.promises.writeFile(outputFilename, `window.wiki10 ??= {};\nwindow.wiki10.pages = ${JSON.stringify(jsonData, undefined, '  ')};`);
    logger.info(`written ${jsonData.length} pages to ${outputFilename}`);
  }
}
