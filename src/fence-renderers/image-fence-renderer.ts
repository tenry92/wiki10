export default {
  generateHtml(info: string, content: string, url: string): [string, string][] {
    const [format, imageUrl] = info.split(' ');
    
    return [['Figure', `<figure class="thumb"><img src="../media/${imageUrl}"></figure>`]];
  },
};
