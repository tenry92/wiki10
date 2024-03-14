import { execFile } from 'node:child_process';

const cache = new Map<string, boolean>();

export default function systemCommandExists(command: string) {
  return new Promise<boolean>(resolve => {
    if (!(command in cache)) {
      execFile('which', [command], error => {
        if (error) {
          cache.set(command, false);
        } else {
          cache.set(command, true);
        }

        resolve(cache.get(command)!);
      });
    } else {
      resolve(cache.get(command)!);
    }
  });
}
