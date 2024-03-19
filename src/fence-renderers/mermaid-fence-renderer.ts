export default {
  generateHtml(info: any, content: string, url: string): [string, string][] {
    return [['Graph', `<pre class="mermaid">${content}</pre>`]];
  },
};
