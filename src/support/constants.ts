export const APP_PACKAGE = 'com.wdiodemoapp';
export const APP_ACTIVITY = 'com.wdiodemoapp.MainActivity';
export const APK_FILE = 'android.wdio.native.app.v2.2.0.apk';

export const TIMEOUTS = {
  element: 15_000,
  launch: 20_000,
  absent: 3_000,
} as const;

/**
 * Settings do UiAutomator2 aplicados no início da sessão (`appium:settings`).
 * `waitForIdleTimeout` padrão do driver é 10000 ms por interação.
 * `waitForSelectorTimeout` 0 deixa o retry com o WDIO (`waitforTimeout`),
 * sem somar outra espera de 10 s nos locators UiSelector.
 */
export const APPIUM_SETTINGS = {
  ignoreUnimportantViews: true,
  waitForIdleTimeout: 500,
  waitForSelectorTimeout: 0,
} as const;
