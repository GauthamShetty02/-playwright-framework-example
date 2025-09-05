import { test, expect } from '@playwright/test';
import { TestFramework, BasePage, Logger, TestData } from 'playwright-test-framework-advanced';

class LoginPage extends BasePage {
  constructor(page) {
    super(page, 'https://demo.playwright.dev/todomvc');
  }

  async addTodo(text) {
    await this.fill('.new-todo', text);
    await this.page.keyboard.press('Enter');
  }

  async getTodoCount() {
    return await this.page.locator('.todo-list li').count();
  }
}

test.describe('Todo App Tests', () => {
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

  test('should add a todo item', async () => {
    const page = framework.getPage();
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.waitForPageLoad();
    
    const todoText = `Test todo ${TestData.generateRandomString(5)}`;
    await loginPage.addTodo(todoText);
    
    const count = await loginPage.getTodoCount();
    expect(count).toBe(1);
    
    Logger.info('Todo added successfully', { todoText, count });
  });
});