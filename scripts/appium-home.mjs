import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const appiumHome = join(process.cwd(), '.appium');
export const appiumBin = join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'appium.cmd' : 'appium',
);

export function appiumEnv() {
  mkdirSync(appiumHome, { recursive: true });
  return {
    ...process.env,
    APPIUM_HOME: appiumHome,
  };
}
