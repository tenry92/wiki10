import MarkdownIt from 'markdown-it';

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
  generateHtml(info: string, content: string, url: string, md: MarkdownIt): [string, string][];

  /**
   * Generate assets.
   * 
   * @param info The string right to the intro fence. This includes the languages and potentially additional options.
   * @param content The actual code content within the fence.
   * @param filePath The base url (without file extension) where a generated file is to be placed.
   */
  generateAssets?(info: string, content: string, filePath: string): PromiseLike<void>;

  /**
   * Check whether this fence renderer is available.
   * 
   * Some renders may be unavailable due to missing system dependencies.
   */
  available?(): PromiseLike<boolean>;

  checkRequirements?(): PromiseLike<void>;
}
