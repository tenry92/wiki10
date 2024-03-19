import MarkdownIt from 'markdown-it';

import ProjectConfiguration from './project-configuration';

export interface FenceRendererInfo {
  /**
   * The original, unparsed info.
   */
  info: string;

  /**
   * The language immediately following the initial three backticks.
   */
  lang?: string;

  /**
   * Space-separated attributes following the language.
   */
  attributes: string[];

  /**
   * title=...
   */
  title?: string;

  /**
   * #id, id=...
   */
  id?: string;

  /**
   * .class, class=...
   */
  cssClasses: string[];

  /**
   * style=...
   */
  cssStyle?: string;

  /**
   * lineos=true, numbered
   */
  numberLines?: boolean;

  /**
   * lineostart=42, startline=42
   */
  startLine?: number;

  /**
   * hl_lines="43-44 50", marked="43-44 50"
   */
  highlightLines: number[];

  /**
   * added=3,6,7-10
   */
  addedLines: number[];

  /**
   * removed=2,8
   */
  removedLines: number[];

  /**
   * dark
   */
  forceDarkMode?: boolean;
}

function isValueTrue(value: string | undefined, fallback: boolean = true) {
  if (value != undefined) {
    if (['yes', 'true', 'on'].includes(value.toLowerCase())) {
      return true;
    }

    if (['no', 'false', 'off'].includes(value.toLowerCase())) {
      return false;
    }
  }

  return fallback;
}

function parseLineNumbers(value: string) {
  const lines = [] as number[];

  const regexp = /(?<start>[0-9]+)(?:-(?<end>[0-9]+))?/g;
  let match;

  while (match = regexp.exec(value)) {
    const start = Number.parseInt(match.groups!.start, 10);
    let end = start;

    if (match.groups!.end) {
      end = Number.parseInt(match.groups!.end, 10);
    }

    for (let line = start; line <= end; ++line) {
      lines.push(line);
    }
  }

  return lines;
}

export function parseFenceInfo(info: string, withLang = true): FenceRendererInfo {
  const parsedInfo: FenceRendererInfo = {
    info,
    attributes: [],
    cssClasses: [],
    highlightLines: [],
    addedLines: [],
    removedLines: [],
  };

  const fenceInfoParams = info.split(/\s+/);

  if (withLang) {
    let lang = fenceInfoParams[0];

    if (lang[0]) {
      parsedInfo.lang = lang;
    }
  }

  const attrRegexp = /(?<name>[^=\s]+)(?:=(?:"(?<quotedValue>.*?)"|(?<value>[^\s]*)))?/g;
  const attrText = fenceInfoParams.slice(withLang ? 1 : 0).join(' ');
  let attrMatch;

  while (attrMatch = attrRegexp.exec(attrText)) {
    const attrName = attrMatch.groups!.name;
    const quotedValue = attrMatch.groups!.quotedValue;
    const value = attrMatch.groups!.value;

    if (attrName[0] == '.') {
      parsedInfo.cssClasses.push(attrName.slice(1));
      continue;
    } else if (attrName[0] == '#') {
      parsedInfo.id = attrName.slice(1);
      continue;
    }

    switch (attrName) {
      case 'title':
        parsedInfo.title = quotedValue || value;
        break;
      case 'style':
        parsedInfo.cssStyle = quotedValue || value;
        break;
      case 'linenos': case 'numbered':
        parsedInfo.numberLines = isValueTrue(quotedValue || value)
        break;
      case 'dark':
        parsedInfo.forceDarkMode = isValueTrue(quotedValue || value)
        break;
      case 'lineostart': case 'startline':
        parsedInfo.startLine = Number.parseInt(quotedValue || value);
        break;
      case 'hl_lines': case 'marked':
        parsedInfo.highlightLines = parseLineNumbers(quotedValue || value);
        break;
      case 'added':
        parsedInfo.addedLines = parseLineNumbers(quotedValue || value);
        break;
      case 'removed':
        parsedInfo.removedLines = parseLineNumbers(quotedValue || value);
        break;
    }
  }

  return parsedInfo;
}

export default interface FenceRenderer {
  /**
   * Generate the HTML that is to be included in the document. This usually is
   * something like an image tag or other HTML markup.
   * 
   * @param info The string right to the intro fence. This includes the languages and potentially additional options.
   * @param content The actual code content within the fence.
   * @param url The base url (without file extension) where a generated file is to be placed.
   * @param md The markdown instance to render inline markdown.
   * 
   * @returns Tuples of `[title, html]` items.
   */
  generateHtml(info: FenceRendererInfo, content: string, url: string, md: MarkdownIt): [string, string][];

  /**
   * Generate assets.
   * 
   * @param info The string right to the intro fence. This includes the languages and potentially additional options.
   * @param content The actual code content within the fence.
   * @param filePath The base url (without file extension) where a generated file is to be placed.
   */
  generateAssets?(info: FenceRendererInfo, content: string, filePath: string, config?: ProjectConfiguration): PromiseLike<void>;

  /**
   * Check whether this fence renderer is available.
   * 
   * Some renders may be unavailable due to missing system dependencies.
   */
  available?(): PromiseLike<boolean>;

  checkRequirements?(): PromiseLike<void>;
}
