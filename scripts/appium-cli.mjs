import { spawnSync } from 'node:child_process';
import { appiumBin, appiumEnv } from './appium-home.mjs';

const args = process.argv.slice(2).join(' ');
const result = spawnSync(`"${appiumBin}" ${args}`, {
  stdio: 'inherit',
  env: appiumEnv(),
  shell: true,
});

process.exit(result.status ?? 1);
