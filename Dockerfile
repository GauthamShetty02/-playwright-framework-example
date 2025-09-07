FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

RUN npm install playwright-test-framework-advanced@^1.0.0
RUN npx playwright install --with-deps

COPY package*.json ./
RUN npm install

COPY . .

COPY ai-analyzer.js retry-runner.js ./

CMD ["node", "retry-runner.js"]