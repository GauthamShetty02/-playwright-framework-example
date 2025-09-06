module.exports = {
  testDir: './tests',
  reporter: [
    ['html'],
    ['allure-playwright']
  ],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] }
    }
  ]
};