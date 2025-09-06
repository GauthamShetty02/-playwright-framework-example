import { test, expect } from '@playwright/test';
import { TestFramework, BasePage, Logger, TestData } from 'playwright-test-framework-advanced';

class FormsPage extends BasePage {
  constructor(page) {
    super(page, 'https://demo.playwright.dev/todomvc');
  }

  async addMultipleTodos(todos) {
    for (const todo of todos) {
      await this.fill('.new-todo', todo);
      await this.page.keyboard.press('Enter');
    }
  }

  async getTodoTexts() {
    return await this.page.locator('.todo-list li label').allTextContents();
  }

  async markTodoComplete(index) {
    await this.page.locator('.todo-list li').nth(index).locator('.toggle').click();
  }

  async deleteTodo(index) {
    await this.page.locator('.todo-list li').nth(index).hover();
    await this.page.locator('.todo-list li').nth(index).locator('.destroy').click();
  }

  async getCompletedCount() {
    return await this.page.locator('.todo-list li.completed').count();
  }

  async getActiveCount() {
    return await this.page.locator('.todo-count strong').textContent();
  }
}

test.describe('Forms and Interactions Tests', () => {
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

  test('should add multiple todo items', async () => {
    const page = framework.getPage();
    const formsPage = new FormsPage(page);
    
    await formsPage.navigate();
    await formsPage.waitForPageLoad();
    
    const todos = [
      `Task 1 ${TestData.generateRandomString(3)}`,
      `Task 2 ${TestData.generateRandomString(3)}`,
      `Task 3 ${TestData.generateRandomString(3)}`
    ];
    
    await formsPage.addMultipleTodos(todos);
    
    const todoTexts = await formsPage.getTodoTexts();
    expect(todoTexts).toHaveLength(3);
    
    Logger.info('Multiple todos added', { count: todoTexts.length, todos: todoTexts });
  });

  test('should mark todo as complete', async () => {
    const page = framework.getPage();
    const formsPage = new FormsPage(page);
    
    await formsPage.navigate();
    await formsPage.waitForPageLoad();
    
    const todoText = `Complete me ${TestData.generateRandomString(3)}`;
    await formsPage.addMultipleTodos([todoText]);
    
    await formsPage.markTodoComplete(0);
    
    const completedCount = await formsPage.getCompletedCount();
    expect(completedCount).toBe(1);
    
    Logger.info('Todo marked as complete', { todoText, completedCount });
  });

  test('should delete todo item', async () => {
    const page = framework.getPage();
    const formsPage = new FormsPage(page);
    
    await formsPage.navigate();
    await formsPage.waitForPageLoad();
    
    const todos = [
      `Delete me ${TestData.generateRandomString(3)}`,
      `Keep me ${TestData.generateRandomString(3)}`
    ];
    
    await formsPage.addMultipleTodos(todos);
    await formsPage.deleteTodo(0);
    
    const remainingTodos = await formsPage.getTodoTexts();
    expect(remainingTodos).toHaveLength(1);
    expect(remainingTodos[0]).toContain('Keep me');
    
    Logger.info('Todo deleted successfully', { remaining: remainingTodos.length });
  });

  test('should show correct active count', async () => {
    const page = framework.getPage();
    const formsPage = new FormsPage(page);
    
    await formsPage.navigate();
    await formsPage.waitForPageLoad();
    
    const todos = [
      `Active 1 ${TestData.generateRandomString(3)}`,
      `Active 2 ${TestData.generateRandomString(3)}`,
      `Complete me ${TestData.generateRandomString(3)}`
    ];
    
    await formsPage.addMultipleTodos(todos);
    await formsPage.markTodoComplete(2);
    
    const activeCount = await formsPage.getActiveCount();
    expect(activeCount).toBe('2');
    
    Logger.info('Active count verified', { activeCount });
  });
});