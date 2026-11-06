# Automação Mobile — Appium + WebdriverIO (Android)

Suíte Android do [WebdriverIO Native Demo App](https://github.com/webdriverio/native-demo-app) v2.2.0, com **Appium 2**, **UiAutomator2** e **WebdriverIO**.

São **18 cenários** de login, formulário e navegação. O projeto segue as capabilities, a Settings API e as estratégias de locator documentadas pelo driver.

## Boas práticas atendidas

O que a documentação do Appium 2 e do driver UiAutomator2 pede, e como este projeto aplica.

| Prática | Onde |
|---|---|
| Capabilities no protocolo W3C, com prefixo `appium:` | `config/wdio.android.conf.ts` |
| `automationName: UiAutomator2` | mesma config |
| `app`, `appPackage`, `appActivity` e `appWaitActivity` explícitos (`com.wdiodemoapp` / `.MainActivity`) | mesma config |
| `autoGrantPermissions` e `disableWindowAnimation` | mesma config. Animações desligadas reduzem flakiness; o driver restaura o estado ao fim da sessão |
| `shouldTerminateApp` ao encerrar a sessão | mesma config |
| `noReset: false` só no início da sessão. Entre os testes, `mobile: terminateApp` + `mobile: activateApp` | `src/support/app.ts`, chamado por `startFromHome` |
| Settings API na capability `appium:settings` | `ignoreUnimportantViews: true`, `waitForIdleTimeout: 500` (o padrão do driver é 10000 ms), `waitForSelectorTimeout: 0` para o retry ficar com o WDIO |
| Timeouts de UI num único lugar | `TIMEOUTS` em `src/support/constants.ts`: 15 s para elemento, 20 s para a tab bar na abertura, 3 s para “o alerta não deve aparecer” |
| Timeouts de ADB e do servidor UiAutomator2 acima do padrão | `adbExecTimeout` 60 s, `androidInstallTimeout` 180 s, launch 60 s, install 120 s. Pensado no emulador frio do CI |
| Ordem de locator do driver: accessibility id, `id` (resource-id), UiSelector. XPath não é usado | telas em `src/screens` e `src/support/selectors.ts` |
| UiSelector só onde não há id nem content-desc (texto de erro, `ListView` do dropdown, botão do alerta) | o driver avisa que o Google pretende remover `UiSelector`; esses pontos são os que não têm id estável |
| Texto via `mobile: replaceElementValue` | `BaseScreen.setText`. Não abre o teclado e não depende de `hideKeyboard` |
| Sem `driver.pause` | o botão Inactive usa espera limitada (`expectHidden`): o teste falha se o alerta surgir dentro da janela |
| Alerta fechado por UiSelector no texto do botão | no Galaxy S23, `mobile: acceptAlert` respondeu `No alert is present` para o AlertDialog deste app. O comando do driver fica de fora |
| Servidor sem `--relaxed-security` | a suíte não usa feature insegura (`mobile: shell` e equivalentes). Quem sobe e encerra o processo é o `@wdio/appium-service` |
| Driver instalado no projeto, versão fixa | `postinstall` roda `appium driver install uiautomator2@4.2.9` com `APPIUM_HOME` em `.appium` |
| `language` e `locale` só quando as duas variáveis existem | no celular pessoal o idioma não muda. No CI os dois ficam `en` / `US`, alinhados aos textos em inglês |
| `skipServerInstallation` desligado por padrão | `APPIUM_SKIP_SERVER_INSTALL=true` só depois da primeira sessão naquele device |
| Evidência de falha | screenshot e page source no Allure e em `reports/failures/`. `RECORD_VIDEO=true` grava a tela e anexa o vídeo só quando o teste falha |
| Screen Objects, massa de dados e cenários separados | `src/screens`, `src/data`, `test/specs` |
| Uma sessão por device | `maxInstances: 1` |
| TypeScript com `strict` | `tsconfig.json` |

## Resultado no Galaxy S23

Execução em 6 de novembro de 2026, aparelho físico Samsung Galaxy S23 (SM-S911B), Android 16, app Native Demo App v2.2.0.

| Suíte | Cenários | Tempo |
|---|---|---|
| Formulário | 6 | 43,4 s |
| Login | 8 | 52,4 s |
| Navegação | 4 | 15,4 s |
| **Total** | **18 passando** | **2 min 30 s** |

A confirmação fechou com código 0 e sem `ERROR` ou `WARN` do WebDriver. O cenário mais longo foi o botão Inactive (9,1 s): a espera é de propósito, para garantir que o alerta não abre.

Desse relógio, cerca de 1 min 49 s é a execução dos testes (com o app reiniciado antes de cada cenário) e cerca de 40 s é a abertura de três sessões Appium, uma por arquivo de spec. Para uma suíte em device físico, com isolamento entre cenários, 2 min 30 s é um tempo bom: cerca de 8 s por cenário, já contando o startup.

## Tecnologias

| Peça | Versão |
|---|---|
| Node.js | 18+ (validar com 22) |
| Appium | 2.19.x |
| UiAutomator2 | 4.2.9, instalado em `.appium` |
| WebdriverIO | 9.x |
| JDK | 17 (Appium e Allure) |

## Estrutura

```
appium-mobile-automation/
├── .github/workflows/android-tests.yml
├── apps/                         # APK baixado por npm run app:download
├── config/wdio.android.conf.ts
├── scripts/                      # APK, driver local, Allure HTTP
├── src/data/                     # usuários e formulário
├── src/screens/                  # Screen Objects
├── src/support/                  # reset, timeouts, evidência, locators
├── test/specs/                   # 18 cenários
└── reports/                      # gerado na execução (não versionado)
```

## Pré-requisitos

- Node.js 18+
- JDK 17 (`JAVA_HOME`)
- Android SDK (`ANDROID_HOME` ou `%LOCALAPPDATA%\Android\Sdk`)
- Emulador ligado ou device com depuração USB (`adb devices` precisa listar `device`)

## Instalação

```bash
npm install
copy .env.example .env
npm run app:download
```

O `postinstall` instala o driver `uiautomator2@4.2.9` em `.appium`. Para repetir:

```bash
npm run appium:setup
npm run appium:doctor
```

No `.env`:

| Variável | Papel |
|---|---|
| `JAVA_HOME` | JDK usado pelo Appium e pelo Allure |
| `ANDROID_HOME` | SDK. Se vazio, usa `%LOCALAPPDATA%\Android\Sdk` |
| `ANDROID_DEVICE_NAME` | Nome do device ou AVD |
| `ANDROID_UDID` | Opcional. Ex.: `emulator-5554` |
| `ANDROID_LANGUAGE` / `ANDROID_LOCALE` | Opcionais e juntos (`en` / `US`). Alteram o idioma do aparelho |
| `APPIUM_PORT` | Padrão `4730` |
| `LOG_LEVEL` | `warn`, `info` ou `debug` |
| `ALLURE_OPEN` | `true` abre o HTML ao fim da suíte |
| `APPIUM_SKIP_SERVER_INSTALL` | `true` só depois da primeira sessão neste device |
| `RECORD_VIDEO` | `true` grava a tela e anexa o vídeo só em falha |

## Executar

Com o device online:

```bash
npm test
npm run test:login
npm run test:forms
npm run test:navigation
```

O relatório abre em `http://127.0.0.1:5050/`. Sem rodar a suíte de novo:

```bash
npm run report
```

Não abra o `index.html` pelo Explorer (`file://` quebra o Allure).

## Cenários

**Login (8)** — válido, inválido, campos vazios, senha curta, e-mail inválido, senha vazia, senha no limite de 8 caracteres.

**Formulário (6)** — envio completo, texto espelhado, switch, cada opção do dropdown, os três botões do alerta Active, botão Inactive sem alerta.

**Navegação (4)** — Home para Forms, Home para Login, ciclo entre abas, tab bar continua acessível.

## CI

[`.github/workflows/android-tests.yml`](.github/workflows/android-tests.yml) sobe um emulador API 30, força locale `en` / `US` e publica o Allure. `ALLURE_OPEN=false`. O `npm ci` dispara o `postinstall` do driver.

## Referências

- [Appium](https://appium.io/docs/en/latest/)
- [Segurança do servidor](https://appium.io/docs/en/latest/guides/security/)
- [Settings API](https://appium.io/docs/en/latest/guides/settings/)
- [Capabilities do UiAutomator2](https://appium.github.io/appium-uiautomator2-driver/latest/reference/capabilities/)
- [Settings do UiAutomator2](https://appium.github.io/appium-uiautomator2-driver/latest/reference/settings/)
- [Estratégias de locator](https://appium.github.io/appium-uiautomator2-driver/latest/reference/locator-strategies/)
- [Execute methods](https://appium.github.io/appium-uiautomator2-driver/latest/reference/execute-methods/)
- [WebdriverIO — Appium Service](https://webdriver.io/docs/appium-service)
- [Native Demo App](https://github.com/webdriverio/native-demo-app)
