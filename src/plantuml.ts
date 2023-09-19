import { spawn } from 'node:child_process';

import logger from './logger';

export enum Format {
  Png = 'png',
  Svg = 'svg',
  Html = 'html',
}

/**
 * Render a plantuml graph.
 * 
 * @param input The plantuml code.
 * @param format The desired file format.
 * @returns Buffer containing the generated image.
 */
export function render(input: string, format: Format = Format.Png): PromiseLike<Buffer> {
  logger.debug(`rendering lilypond as ${format}`);

  return new Promise(async (resolve, reject) => {
    const plantumlArgs = ['-p', `-t${format.toString()}`];

    logger.debug(`spawning \`plantuml ${plantumlArgs.join(' ')}\``);
    const plantuml = spawn('plantuml', plantumlArgs);

    let buffer = Buffer.alloc(0);
    let errorText = '';

    plantuml.stdout.on('data', (data: Buffer) => {
      buffer = Buffer.concat([buffer, data]);
    });

    plantuml.stderr.on('data', (data: Buffer) => {
      errorText += data.toString('utf-8');
    });

    plantuml.on('close', code => {
      logger.debug(`plantuml closed with code ${code}`);

      if (code == 0) {
        logger.info(`rendered plantuml as ${format}`);
        resolve(buffer);
      } else {
        reject(errorText);
      }
    });

    plantuml.stdin.write(input, () => {
      plantuml.stdin.end();
    });
  });
}
