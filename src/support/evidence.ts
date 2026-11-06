import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import allure from '@wdio/allure-reporter';

const failuresDir = join(process.cwd(), 'reports', 'failures');
let recording = false;

function artifactName(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${stamp}-${slug || 'test'}`;
}

export async function startVideoIfEnabled(): Promise<void> {
  recording = false;
  if (process.env.RECORD_VIDEO?.toLowerCase() !== 'true') {
    return;
  }

  try {
    await driver.startRecordingScreen();
    recording = true;
  } catch (error) {
    console.warn('[video] Não foi possível iniciar a gravação:', error);
  }
}

export async function finishVideo(passed: boolean): Promise<void> {
  if (!recording) {
    return;
  }

  recording = false;
  try {
    const video = await driver.stopRecordingScreen();
    if (!passed && video) {
      allure.addAttachment(
        'Screen recording',
        Buffer.from(video, 'base64'),
        'video/mp4',
      );
    }
  } catch (error) {
    console.warn('[video] Não foi possível encerrar a gravação:', error);
  }
}

export async function attachFailure(title: string): Promise<void> {
  mkdirSync(failuresDir, { recursive: true });
  const base = artifactName(title);

  try {
    const screenshot = await driver.takeScreenshot();
    const filepath = join(failuresDir, `${base}.png`);
    writeFileSync(filepath, screenshot, 'base64');
    allure.addAttachment(
      'Screenshot on failure',
      Buffer.from(screenshot, 'base64'),
      'image/png',
    );
  } catch (error) {
    console.warn('[evidence] Não foi possível capturar screenshot:', error);
  }

  try {
    const source = await driver.getPageSource();
    writeFileSync(join(failuresDir, `${base}.xml`), source, 'utf8');
    allure.addAttachment('Page source', source, 'text/xml');
  } catch (error) {
    console.warn('[evidence] Não foi possível capturar o page source:', error);
  }
}
