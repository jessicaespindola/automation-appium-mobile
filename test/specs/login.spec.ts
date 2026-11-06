import allure from '@wdio/allure-reporter';
import HomeScreen from '../../src/screens/HomeScreen.js';
import LoginScreen from '../../src/screens/LoginScreen.js';
import NativeAlert from '../../src/screens/components/NativeAlert.js';
import { users } from '../../src/data/users.js';
import { startFromHome } from '../../src/support/session.js';

describe('Login', () => {
  beforeEach(async () => {
    await startFromHome('Login');
    await HomeScreen.openLogin();
    await LoginScreen.waitForIsShown(true);
  });

  it('deve fazer login com credenciais validas', async () => {
    allure.addSeverity('critical');
    allure.addStory('Login valido');

    await LoginScreen.login(users.valid.email, users.valid.password);

    await NativeAlert.waitForIsShown(true);
    const alertText = await NativeAlert.text();
    await expect(alertText).toContain('Success');
    await expect(alertText).toContain('You are logged in!');

    await NativeAlert.tapButtonWithText('OK');
    await NativeAlert.waitForIsShown(false);
  });

  it('deve exibir erro ao tentar login com as duas credenciais invalidas', async () => {
    allure.addSeverity('normal');
    allure.addStory('Login invalido');

    await LoginScreen.login(users.invalid.email, users.invalid.password);

    await expect(LoginScreen.emailError).toBeDisplayed();
    await expect(LoginScreen.passwordError).toBeDisplayed();
    await NativeAlert.waitForIsShown(false);
  });

  it('deve exibir erro ao tentar login sem preencher o campo email', async () => {
    allure.addSeverity('normal');
    allure.addStory('Login sem email');

    await LoginScreen.login(users.empty.email, users.valid.password);

    await expect(LoginScreen.emailError).toBeDisplayed();
    await NativeAlert.waitForIsShown(false);
  });

  it('deve exibir erro ao tentar login com email e senha vazio', async () => {
    allure.addSeverity('normal');
    allure.addStory('Login com campos vazios');

    await LoginScreen.login(users.empty.email, users.empty.password);

    await expect(LoginScreen.emailError).toBeDisplayed();
    await expect(LoginScreen.passwordError).toBeDisplayed();
    await NativeAlert.waitForIsShown(false);
  });

  it('deve exibir erro ao tentar informar senha com menos de 8 caracteres', async () => {
    allure.addSeverity('normal');
    allure.addStory('Login com senha curta');

    await LoginScreen.login(
      users.shortPassword.email,
      users.shortPassword.password,
    );

    await expect(LoginScreen.passwordError).toBeDisplayed();
    await NativeAlert.waitForIsShown(false);
  });

  it('deve exibir erro ao tentar login com email invalido e senha valida', async () => {
    allure.addSeverity('normal');
    allure.addStory('Login com email invalido');

    await LoginScreen.login(
      users.invalidEmail.email,
      users.invalidEmail.password,
    );

    await expect(LoginScreen.emailError).toBeDisplayed();
    await NativeAlert.waitForIsShown(false);
  });

  it('deve exibir erro ao tentar login com email valido e senha vazia', async () => {
    allure.addSeverity('normal');
    allure.addStory('Login sem senha');

    await LoginScreen.login(users.valid.email, users.empty.password);

    await expect(LoginScreen.passwordError).toBeDisplayed();
    await NativeAlert.waitForIsShown(false);
  });

  it('deve fazer login com senha de exatamente 8 caracteres', async () => {
    allure.addSeverity('normal');
    allure.addStory('Login com senha no limite minimo');

    await LoginScreen.login(
      users.exactPassword.email,
      users.exactPassword.password,
    );

    await NativeAlert.waitForIsShown(true);
    const alertText = await NativeAlert.text();
    await expect(alertText).toContain('Success');
    await expect(alertText).toContain('You are logged in!');

    await NativeAlert.tapButtonWithText('OK');
    await NativeAlert.waitForIsShown(false);
  });
});
