import BaseScreen from './BaseScreen.js';
import { byText, byTextContains } from '../support/selectors.js';

class LoginScreen extends BaseScreen {
  constructor() {
    super('~Login-screen');
  }

  get screen() {
    return $('~Login-screen');
  }

  get loginContainerButton() {
    return $('~button-login-container');
  }

  get email() {
    return $('~input-email');
  }

  get password() {
    return $('~input-password');
  }

  get loginButton() {
    return $('~button-LOGIN');
  }

  get emailError() {
    return $(byText('Please enter a valid email address'));
  }

  get passwordError() {
    return $(byTextContains('Please enter at least 8 characters'));
  }

  async openLoginTab(): Promise<void> {
    await this.loginContainerButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.openLoginTab();
    await this.setText(this.email, email);
    await this.setText(this.password, password);
    await this.loginButton.scrollIntoView({
      scrollableElement: await this.screen,
    });
    await this.loginButton.click();
  }
}

export default new LoginScreen();
