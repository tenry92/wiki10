import { exec } from 'node:child_process';

import logger from './logger';

export interface Midi2StreamOptions {
  soundfont: string;
}

/**
 * Convert a MIDI file to an audio stream.
 * 
 * @param midiFile Path to the MIDI file to convert.
 * @param outputFile Path to the output file to generate.
 * @param options
 */
export default function midi2ogg(midiFile: string, outputFile: string, options: Partial<Midi2StreamOptions> = {}) {
  logger.debug(`converting ${midiFile} to ${outputFile}`);
  
  options = Object.assign({
    soundfont: '/usr/share/sounds/sf2/FluidR3_GM.sf2',
  }, options);

  return new Promise<void>((resolve, reject) => {
    const command = [
      'fluidsynth',
      '-a alsa',
      '-T raw',
      '-F -',
      options.soundfont,
      midiFile,
      '|',
      'ffmpeg',
      '-f s32le',
      '-i -',
      '-y',
      outputFile,
    ];

    logger.debug(`spawning \`${command.join(' ')}\``);

    exec(command.join(' '), error => {
      if (error) {
        reject(error);
      } else {
        logger.info(`converted ${midiFile} to ${outputFile}`);
        resolve();
      }
    });
  });
}
