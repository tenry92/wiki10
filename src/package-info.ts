import fs from 'node:fs';
import path from 'node:path';

interface Package {
  name: string;
  version: string;
}

const packageJson = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8');

export default JSON.parse(packageJson) as Package;
