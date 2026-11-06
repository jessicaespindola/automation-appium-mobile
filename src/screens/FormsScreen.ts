import BaseScreen from './BaseScreen.js';
import { TIMEOUTS } from '../support/constants.js';
import { dropdownValue, listItem, listView } from '../support/selectors.js';

class FormsScreen extends BaseScreen {
  constructor() {
    super('~Forms-screen');
  }

  get screen() {
    return $('~Forms-screen');
  }

  get input() {
    return $('~text-input');
  }

  get inputTextResult() {
    return $('~input-text-result');
  }

  get switch() {
    return $('~switch');
  }

  get switchText() {
    return $('~switch-text');
  }

  get dropDown() {
    return $('~Dropdown');
  }

  get activeButton() {
    return $('~button-Active');
  }

  get inactiveButton() {
    return $('~button-Inactive');
  }

  async isSwitchActive(): Promise<boolean> {
    return (await this.switch.getAttribute('checked')) === 'true';
  }

  async tapOnSwitch(): Promise<void> {
    await this.switch.click();
  }

  async tapOnDropDown(): Promise<void> {
    await this.dropDown.click();
  }

  async selectDropdown(value: string): Promise<void> {
    await this.tapOnDropDown();
    const list = $(listView());
    await list.waitForExist({ timeout: TIMEOUTS.element });
    await $(listItem(value)).click();
    await list.waitForExist({
      timeout: TIMEOUTS.element,
      reverse: true,
    });
  }

  async getDropDownText(): Promise<string> {
    return $(dropdownValue()).getText();
  }

  async typeInput(text: string): Promise<void> {
    await this.setText(this.input, text);
  }

  async tapOnActiveButton(): Promise<void> {
    await this.activeButton.scrollIntoView({
      maxScrolls: 2,
      scrollableElement: await this.screen,
    });
    await this.activeButton.click();
  }

  async tapOnInactiveButton(): Promise<void> {
    await this.inactiveButton.scrollIntoView({
      maxScrolls: 2,
      scrollableElement: await this.screen,
    });
    await this.inactiveButton.click();
  }

  async submitForm(text: string, dropdownOption: string): Promise<void> {
    await this.typeInput(text);

    if (!(await this.isSwitchActive())) {
      await this.tapOnSwitch();
    }

    await this.selectDropdown(dropdownOption);
    await this.tapOnActiveButton();
  }
}

export default new FormsScreen();
