import fs from 'node:fs';

import MarkdownIt from 'markdown-it';

// @ts-ignore
import MarkdownItReplaceLink from 'markdown-it-replace-link';
import MarkdownItAttrs from 'markdown-it-attrs';
// @ts-ignore
import MarkdownItSup from 'markdown-it-sup';
// @ts-ignore
import MarkdownItSub from 'markdown-it-sub';
// @ts-ignore
import MarkdownItDeflist from 'markdown-it-deflist';

import hljs from 'highlight.js';
import yaml from 'js-yaml';
import Mustache from 'mustache';

import File from './file';
import hashCode from './hash-code';
import logger from './logger';
import FenceRenderer from './fence-renderer';
import Page from './page';
import Frontmatter from './frontmatter';

interface MarkdownItExtendedOptions extends MarkdownIt.Options {
  replaceLink(link: string, env: any): string;
}

interface GeneratedAssets {
  [filename: string]: {
    format: string;
    info: string;
    source: string;
  }
}

function highlight(str: string, lang: string, attrs: string) {
  logger.verbose(`highlight code block with language "${lang}"`);

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(str, { language: lang }).value;
      const highlightedLines = highlighted.split('\n').slice(0, -1);

      const lineNumberDigitCount = highlightedLines.length.toString().length;

      return highlightedLines.map((line, index) => {
        return `<span style="user-select: none; margin: 0 1em; color: #333;" class="linenumber">${(index + 1).toString().padStart(lineNumberDigitCount, ' ')}</span>${line}`;
      }).join('\n');
    } catch {
      logger.warn('error highlighting code');
      return '';
    }
  } else {
    logger.verbose(`hljs language "${lang}" not available`);
  }
}

function replaceLink(link: string, env: any) {
  if (link.includes('://')) {
    return link;
  }

  // media
  if (/\.(png|jpe?g|gif|webp)$/.test(link)) {
    return `../media/${link}`;
  }

  // pages
  if (/\.md$/.test(link)) {
    return link.replace(/\.md$/, '.html');
  }

  return link;
}

/**
 * Class for rendering individual pages (markdown to HTML).
 */
export default class PageRenderer {
  private md: MarkdownIt;

  private fenceRenderers: {[format: string]: FenceRenderer} = {};

  public constructor() {
    this.md = new MarkdownIt({
      html: true,
      highlight,
      replaceLink,
    } as MarkdownItExtendedOptions)
      .use(MarkdownItReplaceLink)
      // this conflicts with fence blocks in the style of ```{image}
      // .use(MarkdownItAttrs)
      .use(MarkdownItSup).use(MarkdownItSub)
      .use(MarkdownItDeflist)
    ;

    this.initCustomFenceRenderer();
  }

  public addFenceRenderer(format: string, renderer: FenceRenderer) {
    this.fenceRenderers[format] = renderer;
  }

  public async render(page: Page, env: {}) {
    const source = await this.readSourceFile(page.file);
    let meta: Partial<Frontmatter> | undefined;

    if (source.frontmatter) {
      try {
        meta = (yaml.load(source.frontmatter) || {}) as Partial<Frontmatter>;

        if (typeof meta.title == 'string') {
          page.title = meta.title;
        }

        if (Array.isArray(meta.aliases)) {
          page.aliases = meta.aliases;
        }

        if (Array.isArray(meta.categories)) {
          page.categories = meta.categories;
        }
      } catch (error) {
        console.error(error);
      }
    }

    logger.debug('preprocessing source file (mustache)');
    const preprocessedContent = Mustache.render(source.content, this.makeVariables(page, env));

    logger.verbose('rendering markdown to html');
    const generatedAssets: GeneratedAssets = {};
    const html = this.md.render(preprocessedContent, {
      sourceFile: page.file,
      generatedAssets,
    });

    return {
      html,
      dependencies: [],
      meta: {},
      generatedAssets,
    };
  }

  private makeVariables(page: Page, env: {}) {
    return Object.assign({
      title: page.title,
    }, env);
  }

  private async readSourceFile(sourceFile: File) {
    const contentsSource = await fs.promises.readFile(sourceFile.filePath, 'utf-8');

    const match = /^---\n(.*)\n---\n(.*)/s.exec(contentsSource);

    if (match) {
      return {
        content: match[2],
        frontmatter: match[1],
      };
    }

    return {
      content: contentsSource,
      frontmatter: undefined,
    };
  }

  private initCustomFenceRenderer() {
    const defaultFenceRender = this.md.renderer.rules.fence!;

    this.md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const sourceFile = env.sourceFile as File;
      const generatedAssets = env.generatedAssets as GeneratedAssets;

      const token = tokens[idx];

      const hash = hashCode(token.content).toString(16).slice(0, 16);
      const url = `../cache/${sourceFile.baseName}/${hash}`;

      let hideSourceCode = false;

      const fenceInfoParams = token.info.split(/\s+/);
      let lang = fenceInfoParams[0];

      if (lang[0] == '{' && lang.slice(-1) == '}') {
        lang = lang.slice(1, -1);
        hideSourceCode = true;
      }

      if (lang in this.fenceRenderers) {
        logger.debug(`fence renderer for ${lang} found`);
        const fenceRenderer = this.fenceRenderers[lang];
        const generatedItems = fenceRenderer.generateHtml(token.info, token.content, url, this.md);

        if (fenceRenderer.generateAssets) {
          logger.debug(`fence renderer for ${lang} will generate assets`);
          generatedAssets[hash] = {
            format: lang,
            info: token.info,
            source: token.content,
          };
        } else {
          logger.debug(`fence renderer for ${lang} will not generate assets`);
        }

        const output: string[] = [];

        for (const [title, html] of generatedItems) {
          output.push(`<p><strong>${title}</strong></p><p>${html}</p>`);
        }

        if (!hideSourceCode) {
          output.push(`<details><summary>Source</summary>${defaultFenceRender(tokens, idx, options, env, self)}</details>`);
        }

        return output.join('\n');
      }

      logger.debug(`no fence renderer for ${lang} found`);

      if (hideSourceCode) {
        return '';
      } else {
        return defaultFenceRender(tokens, idx, options, env, self);
      }
    };
  }
}
