import { spawnSync } from 'node:child_process';
import { appiumBin, appiumEnv } from './appium-home.mjs';

const DRIVER_SPEC = 'uiautomator2@4.2.9';

function run(args) {
  const result = spawnSync(`"${appiumBin}" ${args}`, {
    encoding: 'utf8',
    env: appiumEnv(),
    shell: true,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

const listed = run('driver list --installed');
if (listed.status !== 0) {
  process.stderr.write(listed.stderr || listed.stdout);
  process.exit(listed.status ?? 1);
}

if (listed.stdout.includes('uiautomator2@')) {
  console.log('[appium] Driver uiautomator2 já instalado em .appium');
  process.exit(0);
}

console.log(`[appium] Instalando ${DRIVER_SPEC} em .appium`);
const installed = run(`driver install ${DRIVER_SPEC}`);
process.stdout.write(installed.stdout);
process.stderr.write(installed.stderr);
process.exit(installed.status ?? 1);
