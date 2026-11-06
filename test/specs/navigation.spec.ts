import allure from '@wdio/allure-reporter';
import HomeScreen from '../../src/screens/HomeScreen.js';
import FormsScreen from '../../src/screens/FormsScreen.js';
import LoginScreen from '../../src/screens/LoginScreen.js';
import { startFromHome } from '../../src/support/session.js';

describe('Navegacao', () => {
  beforeEach(async () => {
    await startFromHome('Navegacao');
  });

  it('deve navegar da Home para Forms e validar o botao Active', async () => {
    allure.addSeverity('normal');
    allure.addStory('Home para Forms');

    await HomeScreen.openHome();
    await expect(HomeScreen.homeTab).toBeDisplayed();

    await HomeScreen.openForms();
    await FormsScreen.waitForIsShown(true);

    await FormsScreen.activeButton.scrollIntoView({
      maxScrolls: 2,
      scrollableElement: await FormsScreen.screen,
    });

    await expect(FormsScreen.activeButton).toBeDisplayed();
    await expect(FormsScreen.input).toBeDisplayed();
  });

  it('deve navegar da Home para Login', async () => {
    allure.addSeverity('normal');
    allure.addStory('Home para Login');

    await HomeScreen.openHome();
    await expect(HomeScreen.homeTab).toBeDisplayed();

    await HomeScreen.openLogin();
    await LoginScreen.waitForIsShown(true);
    await expect(LoginScreen.email).toBeDisplayed();
  });

  it('deve navegar em ciclo entre Forms, Login e Forms', async () => {
    allure.addSeverity('normal');
    allure.addStory('Ciclo entre tabs');

    await HomeScreen.openForms();
    await FormsScreen.waitForIsShown(true);

    await HomeScreen.openLogin();
    await LoginScreen.waitForIsShown(true);

    await HomeScreen.openForms();
    await FormsScreen.waitForIsShown(true);
    await expect(FormsScreen.input).toBeDisplayed();
  });

  it('deve manter a tab bar acessivel apos navegar', async () => {
    allure.addSeverity('normal');
    allure.addStory('Tab bar permanece acessivel');

    await HomeScreen.openLogin();
    await LoginScreen.waitForIsShown(true);

    await expect(HomeScreen.homeTab).toBeDisplayed();
    await expect(HomeScreen.formsTab).toBeDisplayed();
    await expect(HomeScreen.loginTab).toBeDisplayed();

    await HomeScreen.openForms();
    await FormsScreen.waitForIsShown(true);

    await expect(HomeScreen.homeTab).toBeDisplayed();
    await expect(HomeScreen.formsTab).toBeDisplayed();
    await expect(HomeScreen.loginTab).toBeDisplayed();
  });
});
