import File from './file';

interface GeneratedAssets {
  [filename: string]: {
    format: string;
    source: string;
  }
}

export default class Page {
  /**
   * Whether the source file or direct dependencies have been modified.
   */
  public modified?: boolean;

  public title: string;

  public aliases: string[] = [];

  public categories: string[] = [];

  /**
   * Hierarchy level. A level of 1 is the root level.
   */
  public readonly level: number;

  /**
   * Namespace. A file My/Namespace/Article.md would be `'My/Namespace'`.
   */
  public readonly namespace: string;

  public readonly generatedAssets: GeneratedAssets = {};

  public readonly references = new Set<string>();

  public constructor(public readonly url: string, public readonly file: File) {
    this.title = file.baseName.replaceAll('_', ' ');
    this.level = url.split('/').length;
    this.namespace = url.split('/').slice(0, -1).join('/');
  }
}
