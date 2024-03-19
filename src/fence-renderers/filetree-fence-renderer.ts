import MarkdownIt from 'markdown-it';

import * as filetreeParser from '../filetree-parser';

export default {
  generateHtml(info: any, content: string, url: string, md: MarkdownIt): [string, string][] {
    const rootItems = filetreeParser.parse(content);
    const output: string[] = [];

    function renderItems(items: filetreeParser.Item[], root: boolean = false) {
      if (root) {
        output.push('<ul class="filetree">');
      } else {
        output.push('<ul>');
      }

      for (const item of items) {
        const classList: string[] = [];

        classList.push(item.type);

        output.push(`<li class="${classList.join(' ')}">`);

        const label = md.renderInline(item.name);

        if (item.type == 'folder') {
          output.push(`<details ${item.expanded ? 'open' : ''}><summary>${label}</summary>`);

          if (item.children.length > 0) {
            renderItems(item.children);
          }
  
          output.push('</details>');
        } else {
          output.push(`<span class="label">${label}</span>`);
        }

        output.push('</li>');
      }

      output.push('</ul>');
    }

    renderItems(rootItems, true);

    return [['File tree', output.join('\n')]];
  }
};
