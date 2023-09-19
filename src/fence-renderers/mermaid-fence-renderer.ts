export default {
  generateHtml(info: string, content: string, url: string): [string, string][] {
    return [['Graph', `<pre class="mermaid">${content}</pre>`]];
  },
};
