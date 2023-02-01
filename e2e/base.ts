// webView2Test.ts
import { defineConfig, test as base } from '@playwright/test';
import { execSync, spawn } from 'child_process';

const EXECUTABLE_PATH =
  'C:\\Program Files\\WindowsApps\\Microsoft.MicrosoftOfficeHub_18.2301.1131.0_x64__8wekyb3d8bbwe\\WebViewHost.exe';

export default defineConfig({
  globalTimeout: 60 * 60 * 1000
});

export const test = base.extend({
  browser: async ({ playwright }, use, testInfo) => {
    const cdpPort = 9222 + testInfo.workerIndex;
    // fs.accessSync(EXECUTABLE_PATH, fs.constants.X_OK); // Make sure that the executable exists and is executable
    // const userDataDir = path.join(
    //   fs.realpathSync.native(os.tmpdir()),
    //   `playwright-webview2-tests/user-data-dir-${testInfo.workerIndex}`
    // );
    const webView2Process = spawn(EXECUTABLE_PATH, {
      // shell: true,
      env: {
        ...process.env,
        WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${cdpPort}`
        // WEBVIEW2_USER_DATA_FOLDER: userDataDir
      }
    });

    await new Promise<void>(async (resolve, reject) => {
      console.log(webView2Process.connected);

      webView2Process.stdout.on('data', data => {
        console.log(JSON.parse(data.toString()));
        if (data.toString().includes('WebView2 initialized')) resolve();
      });

      // wait for Harmony Desktop to load
      setTimeout(async () => {
        resolve();
      }, 1000);

      console.log(webView2Process.connected);

      webView2Process.on('message', message => console.log(`message: ${message}`));

      webView2Process.on('exit', () => {
        execSync(`taskkill /pid ${webView2Process.pid} /T /F`);
        console.log('exiting webView2Process');
        // fs.rmdirSync(userDataDir, { recursive: true });
        reject();
      });
    });

    setTimeout(async () => {
      const browser = await playwright.chromium.connectOverCDP(`http://127.0.0.1:${cdpPort}`);
      await use(browser);
    }, 3000);

    // await browser.close();
  },
  context: async ({ browser }, use) => {
    const context = browser.contexts()[0];
    await use(context);
  },
  page: async ({ context }, use) => {
    const page = context.pages()[0];
    await use(page);
  }
});

export { expect } from '@playwright/test';
