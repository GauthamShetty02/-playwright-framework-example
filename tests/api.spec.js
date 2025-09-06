import { test, expect } from '@playwright/test';
import { TestFramework, Logger, TestData } from 'playwright-test-framework-advanced';

test.describe('API Tests', () => {
  
  test('GET /users - should return users list', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/users');
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
    
    Logger.info('Users API test completed', { userCount: users.length });
  });

  test('POST /posts - should create new post', async ({ request }) => {
    const newPost = {
      title: `Test Post ${TestData.generateRandomString(5)}`,
      body: 'This is a test post body',
      userId: 1
    };

    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
      data: newPost
    });
    
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toBe(newPost.title);
    
    Logger.info('Post created successfully', { postId: createdPost.id });
  });

  test('GET /posts/1 - should return specific post', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.id).toBe(1);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    
    Logger.info('Single post retrieved', { postId: post.id, title: post.title });
  });
});