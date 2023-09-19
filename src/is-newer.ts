import fs from 'node:fs';

export default async function isNewer(newFile: string, oldFile: string) {
  try {
    const [newStats, oldStats] = await Promise.all([
      fs.promises.stat(newFile),
      fs.promises.stat(oldFile),
    ]);

    return newStats.mtimeMs > oldStats.mtimeMs;
  } catch {
    return true;
  }
}