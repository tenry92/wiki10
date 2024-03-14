import fs from 'node:fs';
import { ChildProcess, spawn } from 'node:child_process';

import logger from './logger';
import TempFile from './temp-file';
import TempDir from './temp-dir';
import systemCommandExists from './system-command-exists';

export enum Format {
  Png = 'png',
  Svg = 'svg',
  Midi = 'midi',
}

/**
 * Trim empty space from the given SVG file.
 * 
 * @param filename SVG file to trim. This file will be replaced.
 * @returns The filename (same as the parameter).
 */
function trimSvg(filename: string): PromiseLike<string> {
  // https://www.manuel-strehl.de/trim_lilypond_svg
  return new Promise(async (resolve, reject) => {
    const copyFilename = `${filename}~`;

    await fs.promises.rename(filename, copyFilename);

    const inkscapeArgs = [
      '-z',
      '--export-area-drawing',
      `--export-plain-svg=${filename}`,
      copyFilename,
    ];

    logger.debug(`spawning \`inkscape ${inkscapeArgs.join(' ')}\``);
    const inkscape = spawn('inkscape', inkscapeArgs);

    inkscape.on('close', async code => {
      logger.debug(`inkscape closed with code ${code}`);

      try {
        await fs.promises.unlink(copyFilename);
      } catch (error) {}

      if (code != 0) {
        reject('error code: ' + code);
        return;
      }

      resolve(filename);
    });
  });
}

function waitChildProcessClose(childProc: ChildProcess) {
  return new Promise<number>((resolve, reject) => {
    childProc.on('close', resolve);
  });
}

export function available() {
  return systemCommandExists('lilypond');
}

/**
 * Render `input` (lilypond code).
 * 
 * @param input The lilypond code.
 * @param format The desired file format.
 * @returns Buffer containing the generated image or audio.
 */
export function render(input: string, format: Format = Format.Png): PromiseLike<Buffer> {
  logger.debug(`rendering lilypond as ${format}`);

  return new Promise(async (resolve, reject) => {
    await using tempDir = new TempDir();
    await tempDir.create();
    const inputFilename = `${tempDir}/score.ly`;
    const outputBasename = `${tempDir}/score`;
    const outputFilename = `${outputBasename}.${format.toString()}`;

    const midi = format == Format.Midi;

    let parts = [
      '\\version "2.22.2"',
    ];

    parts.push(`music = ${input}`);

    if (midi) {
      parts.push('\\score { \\unfoldRepeats \\music \\midi {} }');
    } else {
      parts.push('\\score { \\music }');
      parts.push('\\header {\n  tagline = ""\n}');
    }

    await using inputFile = new TempFile(inputFilename);
    const generatedSource = parts.join('\n');
    await fs.promises.writeFile(inputFile.path, generatedSource);

    await using outputFile = new TempFile(outputFilename);

    const lilypondArgs = [
      '--silent',
      '-dn-opoint-and-click',
      ...(midi ? [] : ['-f', format.toString()]),
      '-o', outputBasename,
      inputFilename,
    ];

    logger.debug(`spawning \`lilypond ${lilypondArgs.join(' ')}\``);
    const lilypond = spawn('lilypond', lilypondArgs);

    let errorText = '';

    lilypond.stderr.on('data', chunk => {
      errorText += chunk.toString('utf-8');
    });

    const code = await waitChildProcessClose(lilypond);

    logger.debug(`lilypond closed with code ${code}`);

    if (code) {
      reject(new Error(errorText));
      return;
    }

    let buffer: Buffer | undefined;

    if (format == Format.Svg) {
      await trimSvg(outputFile.path);
    }

    try {
      buffer = await fs.promises.readFile(outputFile.path);
    } catch (error) {
      console.error(error);
    }

    if (!buffer || code != 0) {
      reject('error code: ' + code);
      return;
    }

    logger.verbose(`rendered lilypond as ${format}`);
    resolve(buffer);
  });
}
