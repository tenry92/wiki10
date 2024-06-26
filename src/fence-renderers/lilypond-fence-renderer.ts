import fs from 'node:fs';

import * as lilypond from '../lilypond';
import midi2ogg from '../midi2ogg';
import logger from '../logger';
import systemCommandExists from '../system-command-exists';
import ProjectConfiguration from '../project-configuration';

export default {
  async available() {
    return await lilypond.available() && systemCommandExists('fluidsynth');
  },
  async checkRequirements() {
    if (!await lilypond.available()) {
      logger.warn(`lilypond not installed`);
    }
  },
  generateHtml(info: any, content: string, url: string): [string, string][] {
    return [
      ['Score', `<img src="${url}.svg" alt="">`],
      ['Music', `<audio src="${url}.ogg" controls>`],
    ];
  },
  async generateAssets(info: any, content: string, filePath: string, config: ProjectConfiguration) {
    const svg = await lilypond.render(content, lilypond.Format.Svg);
    logger.debug(`writing ${filePath}.svg`);
    await fs.promises.writeFile(`${filePath}.svg`, svg);
    logger.info(`written ${filePath}.svg`);

    const midi = await lilypond.render(content, lilypond.Format.Midi);
    logger.debug(`writing ${filePath}.midi`);
    await fs.promises.writeFile(`${filePath}.midi`, midi);
    logger.info(`written ${filePath}.midi`);

    logger.debug(`writing ${filePath}.ogg`);
    await midi2ogg(`${filePath}.midi`, `${filePath}.ogg`, {soundfont: config.soundfont});
    logger.info(`written ${filePath}.ogg`);
  },
};
