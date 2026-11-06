import { TIMEOUTS } from '../../support/constants.js';
import { byText } from '../../support/selectors.js';

const TITLE = 'id=com.wdiodemoapp:id/alert_title';
const MESSAGE = 'id=android:id/message';

class NativeAlert {
  static async waitForIsShown(isShown = true): Promise<boolean | void> {
    return $(TITLE).waitForExist({
      timeout: TIMEOUTS.element,
      reverse: !isShown,
    });
  }

  /**
   * Garante que o alerta não apareça dentro da janela.
   * `reverse: true` retorna na hora se o elemento já está ausente,
   * então não serve para "não deve surgir".
   */
  static async expectHidden(timeout = TIMEOUTS.absent): Promise<void> {
    try {
      await $(TITLE).waitForExist({ timeout });
    } catch {
      return;
    }

    throw new Error(`O alerta apareceu em até ${timeout}ms`);
  }

  static async tapButtonWithText(text: string): Promise<void> {
    // acceptAlert não enxerga o AlertDialog deste app (S23: "No alert is present").
    await $(byText(text.toUpperCase())).click();
  }

  static async text(): Promise<string> {
    const title = await $(TITLE).getText();
    const message = await $(MESSAGE).getText();
    return `${title}\n${message}`;
  }
}

export default NativeAlert;
