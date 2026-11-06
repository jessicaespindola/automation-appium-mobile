import { join, basename, delimiter as pathDelimiter } from 'node:path';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execSync, spawn } from 'node:child_process';
import { config as dotenvConfig } from 'dotenv';
import type { Options } from '@wdio/types';
import {
  APK_FILE,
  APP_ACTIVITY,
  APP_PACKAGE,
  APPIUM_SETTINGS,
  TIMEOUTS,
} from '../src/support/constants.js';
import { attachFailure, finishVideo, startVideoIfEnabled } from '../src/support/evidence.js';

dotenvConfig();

const appiumHome = join(process.cwd(), '.appium');
process.env.APPIUM_HOME = process.env.APPIUM_HOME || appiumHome;
mkdirSync(process.env.APPIUM_HOME, { recursive: true });

function resetDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function writeAllureEnvironment(dir: string): void {
  const lines = [
    `Device=${process.env.ANDROID_DEVICE_NAME || 'Android'}`,
    `UDID=${process.env.ANDROID_UDID || 'n/a'}`,
    `PlatformVersion=${process.env.ANDROID_PLATFORM_VERSION || 'n/a'}`,
    `Language=${process.env.ANDROID_LANGUAGE || 'device'}`,
    `Locale=${process.env.ANDROID_LOCALE || 'device'}`,
    `APK=${basename(apkPath)}`,
    `AppiumPort=${String(appiumPort)}`,
    `Automation=UiAutomator2`,
    `AppPackage=${APP_PACKAGE}`,
  ];
  writeFileSync(join(dir, 'environment.properties'), `${lines.join('\n')}\n`, 'utf8');
}

function generateAllureReport(): void {
  const reportDir = join(process.cwd(), 'reports', 'allure-report');
  const allureBin = join(
    process.cwd(),
    'node_modules',
    'allure-commandline',
    'bin',
    process.platform === 'win32' ? 'allure.bat' : 'allure',
  );
  const cmd = existsSync(allureBin) ? `"${allureBin}"` : 'npx allure';

  try {
    execSync(
      `${cmd} generate "${allureResultsDir}" -o "${reportDir}" --clean`,
      { stdio: 'inherit', env: process.env },
    );
    console.log(`[allure] Relatório HTML: ${join(reportDir, 'index.html')}`);
  } catch (error) {
    console.warn('[allure] Falha ao gerar o relatório HTML:', error);
    return;
  }

  const shouldOpen = (process.env.ALLURE_OPEN || 'true').toLowerCase() !== 'false';
  if (!shouldOpen) {
    console.log('[allure] ALLURE_OPEN=false — abra com: npm run report:open');
    return;
  }

  try {
    const serveScript = join(process.cwd(), 'scripts', 'serve-allure.mjs');
    const child = spawn(process.execPath, [serveScript, reportDir], {
      detached: true,
      stdio: 'ignore',
      cwd: process.cwd(),
      env: process.env,
      windowsHide: false,
    });
    child.unref();
    console.log('[allure] Servidor HTTP iniciado — o relatório abre em http://127.0.0.1:5050/');
  } catch (error) {
    console.warn('[allure] Não foi possível abrir o relatório:', error);
  }
}

const defaultSdk = join(
  process.env.LOCALAPPDATA || join(process.env.USERPROFILE || '', 'AppData', 'Local'),
  'Android',
  'Sdk',
);
const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || defaultSdk;

if (!existsSync(androidHome)) {
  throw new Error(
    `Android SDK não encontrado em "${androidHome}". Defina ANDROID_HOME no arquivo .env`,
  );
}

process.env.ANDROID_HOME = androidHome;
process.env.ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT || androidHome;

const javaHome = process.env.JAVA_HOME?.trim();
const javaBinName = process.platform === 'win32' ? 'java.exe' : 'java';
const javaBin = javaHome ? join(javaHome, 'bin', javaBinName) : '';
if (!javaHome || !existsSync(javaBin)) {
  throw new Error(
    `JAVA_HOME inválido. Defina JAVA_HOME apontando para um JDK/JRE com bin/${javaBinName}.`,
  );
}
process.env.JAVA_HOME = javaHome;
process.env.PATH = `${join(javaHome, 'bin')}${process.env.PATH ? `${pathDelimiter}${process.env.PATH}` : ''}`;

const allureResultsDir = join(process.cwd(), 'reports', 'allure-results');
const appiumLogPath = join(process.cwd(), 'reports', 'appium.log');

mkdirSync(join(process.cwd(), 'reports'), { recursive: true });

const apkPath = join(process.cwd(), 'apps', APK_FILE);
const appiumPort = Number(process.env.APPIUM_PORT || 4730);
const logLevel = (process.env.LOG_LEVEL || 'warn') as Options.WebDriverLogTypes;
const skipServerInstallation = process.env.APPIUM_SKIP_SERVER_INSTALL?.toLowerCase() === 'true';
const deviceLocale =
  process.env.ANDROID_LANGUAGE && process.env.ANDROID_LOCALE
    ? {
        'appium:language': process.env.ANDROID_LANGUAGE,
        'appium:locale': process.env.ANDROID_LOCALE,
      }
    : {};

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',

  hostname: '127.0.0.1',
  port: appiumPort,
  path: '/',

  specs: [join(process.cwd(), 'test', 'specs', '**', '*.spec.ts')],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: 'Android',
      'wdio:maxInstances': 1,
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
      ...(process.env.ANDROID_PLATFORM_VERSION
        ? { 'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION }
        : {}),
      ...(process.env.ANDROID_UDID ? { 'appium:udid': process.env.ANDROID_UDID } : {}),
      ...deviceLocale,
      'appium:orientation': 'PORTRAIT',
      'appium:automationName': 'UiAutomator2',
      'appium:app': apkPath,
      'appium:appPackage': APP_PACKAGE,
      'appium:appActivity': APP_ACTIVITY,
      'appium:appWaitActivity': APP_ACTIVITY,
      'appium:appWaitDuration': 30_000,
      'appium:noReset': false,
      'appium:shouldTerminateApp': true,
      'appium:autoGrantPermissions': true,
      'appium:disableWindowAnimation': true,
      'appium:newCommandTimeout': 240,
      'appium:adbExecTimeout': 60_000,
      'appium:androidInstallTimeout': 180_000,
      'appium:uiautomator2ServerLaunchTimeout': 60_000,
      'appium:uiautomator2ServerInstallTimeout': 120_000,
      ...(skipServerInstallation ? { 'appium:skipServerInstallation': true } : {}),
      'appium:settings': APPIUM_SETTINGS,
    },
  ],

  logLevel,
  bail: 0,
  waitforTimeout: TIMEOUTS.element,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 2,

  services: [
    [
      'appium',
      {
        args: {
          address: '127.0.0.1',
          port: appiumPort,
          log: appiumLogPath,
        },
        command: 'appium',
        appiumStartTimeout: 120_000,
        logPath: join(process.cwd(), 'reports'),
      },
    ],
  ],

  framework: 'mocha',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: allureResultsDir,
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120_000,
  },

  onPrepare: async function () {
    resetDir(allureResultsDir);
    writeAllureEnvironment(allureResultsDir);
  },

  onComplete: async function () {
    generateAllureReport();
  },

  beforeTest: async function () {
    await startVideoIfEnabled();
  },

  afterTest: async function (test, _context, { error, passed }) {
    const failed = !passed || Boolean(error);
    await finishVideo(!failed);

    if (!failed) {
      return;
    }

    await attachFailure(test.title);
  },
};
