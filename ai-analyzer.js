import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

class AIFailureAnalyzer {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async analyzeFailureLogs(logPath) {
    try {
      const logContent = fs.readFileSync(logPath, 'utf8');
      
      // Extract test failures
      const failedTests = this.extractFailedTests(logContent);
      
      const prompt = `
        Analyze this test failure log and provide detailed analysis:
        1. Which specific test cases failed
        2. Root cause of each failure
        3. Whether failures are retryable (network, timeout, flaky, selector issues)
        4. Suggested fixes for each failure
        5. Overall retry strategy
        
        Failed Tests Detected:
        ${failedTests.map(test => `- ${test.name}: ${test.error}`).join('\n')}
        
        Full Log Content (last 2000 chars):
        ${logContent.slice(-2000)}
        
        Respond in JSON format:
        {
          "failedTests": [
            {
              "testName": "test name",
              "errorType": "selector|network|timeout|assertion",
              "errorMessage": "specific error",
              "suggestedFix": "how to fix this test"
            }
          ],
          "rootCause": "overall root cause",
          "isRetryable": boolean,
          "retryStrategy": "immediate|delayed|skip",
          "suggestedFix": "overall suggested fix",
          "confidence": 0.0-1.0
        }
      `;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens: 500
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return {
        failedTests: [],
        rootCause: 'Analysis failed',
        isRetryable: true,
        retryStrategy: 'delayed',
        suggestedFix: 'Manual investigation needed',
        confidence: 0.0
      };
    }
  }

  extractFailedTests(logContent) {
    const failedTests = [];
    const lines = logContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for test failure patterns
      if (line.includes('›') && (line.includes('failed') || line.includes('✘'))) {
        const testMatch = line.match(/› (.+?) ›/);
        if (testMatch) {
          const testName = testMatch[1];
          
          // Look for error details in following lines
          let errorMessage = '';
          for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
            if (lines[j].includes('Error:') || lines[j].includes('TimeoutError:') || lines[j].includes('expect(')) {
              errorMessage = lines[j].trim();
              break;
            }
          }
          
          failedTests.push({
            name: testName,
            error: errorMessage || 'Unknown error'
          });
        }
      }
    }
    
    return failedTests;
  }

  async shouldRetry(analysis, attemptCount = 1) {
    if (attemptCount >= 3) return false;
    if (!analysis.isRetryable) return false;
    if (analysis.confidence < 0.5) return false;
    
    return analysis.retryStrategy !== 'skip';
  }

  getRetryDelay(strategy, attempt) {
    switch (strategy) {
      case 'immediate': return 0;
      case 'delayed': return Math.min(1000 * Math.pow(2, attempt), 30000);
      default: return 5000;
    }
  }
}

export default AIFailureAnalyzer;