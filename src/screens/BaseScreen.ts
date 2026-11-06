import { TIMEOUTS } from '../support/constants.js';

export default class BaseScreen {
  constructor(protected readonly selector: string) {}

  async waitForIsShown(isShown = true): Promise<boolean | void> {
    return $(this.selector).waitForDisplayed({
      reverse: !isShown,
      timeout: TIMEOUTS.element,
    });
  }

  /**
   * Grava o texto direto no elemento (`mobile: replaceElementValue`).
   * Não abre o teclado, então a suíte não depende de `hideKeyboard`.
   */
  protected async setText(
    element: ReturnType<typeof $>,
    value: string,
  ): Promise<void> {
    const resolved = await element;
    await driver.execute('mobile: replaceElementValue', {
      elementId: resolved.elementId,
      text: value,
    });
  }
}
