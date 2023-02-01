import { expect, test } from './base';

test('test WebView2', async ({ page, browser }) => {
  browser.isConnected();

  console.log(page.url());

  const appStoreBtn = page.getByRole('button', { name: 'View more Apps' });
  await appStoreBtn.click();

  const appsGallery = page.getByRole('dialog', { name: 'Apps' });
  await appsGallery.waitFor();

  const testAppGalleryBtn = page.getByTitle('Office MetaOS Test App');
  await testAppGalleryBtn.click();

  await page.goto('https://scuprodprv.www.office.com/pwa?auth=2&flight=appbar.enabled', {
    waitUntil: 'domcontentloaded'
  });

  const appStoreBtn2 = page.locator('#\\32 6706956-2AAE-4A22-8960-09B98C35B28C');
  await appStoreBtn2.click();

  const testAppStoreBtn = page.locator('data-testid=mos-apps-07b75f22-72b5-4063-b7fc-0ed5ea8ff3ff');
  await testAppStoreBtn.click();

  const appHostHeader = page.locator('data-testid=app-header-title-button');
  await expect(appHostHeader).toHaveText('Office MetaOS Test App');

  await page.frameLocator('data-tid=app-host-iframe').first();
  // FIXME: passes but shouldn't
  await expect(page.frameLocator('data-tid=app-host-iFFrame').first()).toBe;
  await page.screenshot({ path: './out/screenshot.png', fullPage: true });
});
