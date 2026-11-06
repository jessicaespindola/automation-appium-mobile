import { APP_PACKAGE } from './constants.js';

export async function resetApp(): Promise<void> {
  try {
    await driver.execute('mobile: terminateApp', {
      appId: APP_PACKAGE,
      timeout: 2000,
    });
  } catch {
    // A primeira sessão pode encontrar o processo já encerrado.
  }

  await driver.execute('mobile: activateApp', { appId: APP_PACKAGE });
}
