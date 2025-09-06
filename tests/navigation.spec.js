import { test, expect } from '@playwright/test';
import { TestFramework, BasePage, Logger } from 'playwright-test-framework-advanced';

class NavigationPage extends BasePage {
  constructor(page) {
    super(page, 'https://playwright.dev');
  }

  async clickGetStarted() {
    await this.click('text=Get started');
  }

  async clickDocs() {
    await this.click('text=Docs');
  }

  async getPageTitle() {
    return await this.page.title();
  }
}

test.describe('Navigation Tests', () => {
  let framework;

  test.beforeEach(async () => {
    framework = new TestFramework({
      browserName: 'chromium',
      headless: true
    });
    await framework.setup();
  });

  test.afterEach(async () => {
    await framework.teardown();
  });

  test('should navigate to Playwright homepage', async () => {
    const page = framework.getPage();
    const navPage = new NavigationPage(page);
    
    await navPage.navigate();
    await navPage.waitForPageLoad();
    
    const title = await navPage.getPageTitle();
    expect(title).toContain('Playwright');
    
    Logger.info('Homepage navigation successful', { title });
  });

  test('should navigate to Get Started page', async () => {
    const page = framework.getPage();
    const navPage = new NavigationPage(page);
    
    await navPage.navigate();
    await navPage.waitForPageLoad();
    await navPage.clickGetStarted();
    
    await page.waitForURL('**/intro');
    const url = page.url();
    expect(url).toContain('intro');
    
    Logger.info('Get Started navigation successful', { url });
  });

  test('should navigate to Docs page', async () => {
    const page = framework.getPage();
    const navPage = new NavigationPage(page);
    
    await navPage.navigate();
    await navPage.waitForPageLoad();
    await navPage.clickDocs();
    
    await page.waitForURL('**/docs/**');
    const url = page.url();
    expect(url).toContain('docs');
    
    Logger.info('Docs navigation successful', { url });
  });
});