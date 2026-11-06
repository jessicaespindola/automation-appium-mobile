import allure from '@wdio/allure-reporter';
import HomeScreen from '../../src/screens/HomeScreen.js';
import FormsScreen from '../../src/screens/FormsScreen.js';
import NativeAlert from '../../src/screens/components/NativeAlert.js';
import { forms } from '../../src/data/forms.js';
import { startFromHome } from '../../src/support/session.js';

describe('Formulario', () => {
  beforeEach(async () => {
    await startFromHome('Forms');
    await HomeScreen.openForms();
    await FormsScreen.waitForIsShown(true);
  });

  it('deve preencher o formulario e enviar os dados', async () => {
    allure.addSeverity('critical');
    allure.addStory('Preencher e enviar formulario');

    await FormsScreen.submitForm(forms.sample.text, forms.sample.dropdown);

    await NativeAlert.waitForIsShown(true);
    const alertText = await NativeAlert.text();
    await expect(alertText).toContain('This button is');
    await expect(alertText.toLowerCase()).toContain('active');

    await NativeAlert.tapButtonWithText('OK');
    await NativeAlert.waitForIsShown(false);

    await expect(FormsScreen.inputTextResult).toHaveText(
      expect.stringContaining(forms.sample.text),
    );
    await expect(await FormsScreen.isSwitchActive()).toEqual(true);
    await expect(await FormsScreen.getDropDownText()).toContain(
      forms.sample.dropdown,
    );
  });

  it('deve digitar no input e validar o texto espelhado', async () => {
    allure.addSeverity('normal');
    allure.addStory('Input espelha texto digitado');

    await FormsScreen.typeInput(forms.sample.text);

    await expect(FormsScreen.inputTextResult).toHaveText(
      expect.stringContaining(forms.sample.text),
    );
  });

  it('deve ligar e desligar o switch', async () => {
    allure.addSeverity('normal');
    allure.addStory('Toggle do switch');

    if (await FormsScreen.isSwitchActive()) {
      await FormsScreen.tapOnSwitch();
    }
    await expect(await FormsScreen.isSwitchActive()).toEqual(false);

    await FormsScreen.tapOnSwitch();
    await expect(await FormsScreen.isSwitchActive()).toEqual(true);

    await FormsScreen.tapOnSwitch();
    await expect(await FormsScreen.isSwitchActive()).toEqual(false);
  });

  it('deve selecionar cada opcao do dropdown', async () => {
    allure.addSeverity('normal');
    allure.addStory('Selecao de dropdown');

    for (const option of forms.dropdownOptions) {
      await FormsScreen.selectDropdown(option);
      await expect(await FormsScreen.getDropDownText()).toContain(option);
    }
  });

  it('deve abrir o alert Active e fecha-lo com os 3 botoes', async () => {
    allure.addSeverity('normal');
    allure.addStory('Alert Active com multiplos botoes');

    await FormsScreen.tapOnActiveButton();
    await NativeAlert.waitForIsShown(true);
    await expect(await NativeAlert.text()).toContain('This button is');

    await NativeAlert.tapButtonWithText('Ask me later');
    await NativeAlert.waitForIsShown(false);

    await FormsScreen.tapOnActiveButton();
    await NativeAlert.waitForIsShown(true);
    await NativeAlert.tapButtonWithText('Cancel');
    await NativeAlert.waitForIsShown(false);

    await FormsScreen.tapOnActiveButton();
    await NativeAlert.waitForIsShown(true);
    await NativeAlert.tapButtonWithText('OK');
    await NativeAlert.waitForIsShown(false);
  });

  it('deve determinar que o botao Inactive nao abre alert', async () => {
    allure.addSeverity('normal');
    allure.addStory('Botao Inactive');

    await NativeAlert.expectHidden();
    await FormsScreen.tapOnInactiveButton();
    await NativeAlert.expectHidden();
  });
});
