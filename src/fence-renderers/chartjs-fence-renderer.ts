export default {
  generateHtml(info: any, content: string, url: string): [string, string][] {
    return [['Chart', `<canvas></canvas><script>{const canvas = document.currentScript.previousElementSibling; new Chart(canvas, ${content});}</script>`]];
  },
};
