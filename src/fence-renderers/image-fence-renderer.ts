import { FenceRendererInfo } from '../fence-renderer';

export default {
  generateHtml(info: FenceRendererInfo, content: string, url: string): [string, string][] {
    const [format, imageUrl] = info.info.split(' ');
    
    return [['Figure', `<figure class="thumb"><img src="../media/${imageUrl}"></figure>`]];
  },
};
