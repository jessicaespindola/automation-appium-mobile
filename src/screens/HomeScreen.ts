import { TIMEOUTS } from '../support/constants.js';

class HomeScreen {
  get homeTab() {
    return $('~Home');
  }

  get loginTab() {
    return $('~Login');
  }

  get formsTab() {
    return $('~Forms');
  }

  get webviewTab() {
    return $('~Webview');
  }

  get swipeTab() {
    return $('~Swipe');
  }

  async waitForTabBarShown(): Promise<boolean | void> {
    return this.homeTab.waitForDisplayed({ timeout: TIMEOUTS.launch });
  }

  async openHome(): Promise<void> {
    await this.homeTab.click();
  }

  async openLogin(): Promise<void> {
    await this.loginTab.click();
  }

  async openForms(): Promise<void> {
    await this.formsTab.click();
  }

  async openWebview(): Promise<void> {
    await this.webviewTab.click();
  }

  async openSwipe(): Promise<void> {
    await this.swipeTab.click();
  }
}

export default new HomeScreen();
