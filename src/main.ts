import path from 'node:path';
import fs from 'node:fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import Builder from './builder';
import logger from './logger';
import Directory from './directory';

import pkg from '../package.json';

logger.info(`${pkg.name} version ${pkg.version}`);

yargs(hideBin(process.argv))
  .option('verbose', {
    alias: 'v',
    count: true,
    global: true,
  })
  .option('rebuild-pages', {})
  .option('rebuild-assets', {})
  .command('build [path]', 'build project at path', yargs => {
    return yargs
      .positional('path', {
        describe: 'path to the project',
        type: 'string',
        demandOption: true,
      });
  }, argv => {
    const builder = new Builder(path.resolve(argv.path));

    if (argv.rebuildPages) {
      builder.forceBuildPages = true;
    }

    if (argv.rebuildAssets) {
      builder.forceBuildAssets = true;
    }

    logger.debug(`project path is ${argv.path}`);
    logger.debug(`force build pages is ${builder.forceBuildPages ? 'ON' : 'OFF'}`);
    logger.debug(`force build assets is ${builder.forceBuildAssets ? 'ON' : 'OFF'}`);

    builder.build();
  })
  .command('init [path]', 'create new project at path', yargs => {
    return yargs
      .positional('path', {
        describe: 'path where to create the project',
        type: 'string',
        demandOption: true,
      });
  }, async (argv) => {
    const projectPath = path.resolve(argv.path);
    const projectSourceDirectory = new Directory(`${projectPath}/source`);
    const templateDirectory = new Directory(path.resolve(__dirname, '../template'));
    await templateDirectory.scan();
    await fs.promises.mkdir(`${projectPath}/source/media`, { recursive: true });
    await templateDirectory.syncTo(projectSourceDirectory);
    logger.info(`${projectPath} initialized`);
  })
  .middleware(argv => {
    if (argv.verbose > 0) {
      switch (argv.verbose) {
        case 1:
          logger.level = 'verbose';
          break;
        default:
        case 2:
          logger.level = 'debug';
          break;
      }
    }
  })
  .strictCommands()
  .demandCommand()
  .help()
  .parse();
