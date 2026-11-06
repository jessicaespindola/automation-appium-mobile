import allure from '@wdio/allure-reporter';
import HomeScreen from '../screens/HomeScreen.js';
import { resetApp } from './app.js';

export async function startFromHome(feature: string): Promise<void> {
  allure.addEpic('Native Demo App');
  allure.addFeature(feature);
  await resetApp();
  await HomeScreen.waitForTabBarShown();
}
