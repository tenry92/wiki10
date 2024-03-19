import fs from 'node:fs';

import * as plantuml from '../plantuml';
import logger from '../logger';

export default {
  generateHtml(info: any, content: string, url: string): [string, string][] {
    return [
      ['Graph', `<img src="${url}.svg" alt="">`],
    ];
  },
  async generateAssets(info: any, content: string, filePath: string) {
    const svg = await plantuml.render(content, plantuml.Format.Svg);
    logger.debug(`writing ${filePath}.svg`);
    await fs.promises.writeFile(`${filePath}.svg`, svg);
    logger.info(`written ${filePath}.svg`);
  },
};
