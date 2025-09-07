const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

class AIFailureAnalyzer {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async analyzeFailureLogs(logPath) {
    try {
      const logContent = fs.readFileSync(logPath, 'utf8');
      
      const prompt = `
        Analyze this test failure log and provide:
        1. Root cause of failure
        2. Whether it's retryable (network, timeout, flaky)
        3. Suggested fix
        4. Retry strategy (immediate, delayed, skip)
        
        Log content:
        ${logContent.slice(-2000)} // Last 2000 chars
        
        Respond in JSON format:
        {
          "rootCause": "description",
          "isRetryable": boolean,
          "retryStrategy": "immediate|delayed|skip",
          "suggestedFix": "description",
          "confidence": 0.0-1.0
        }
      `;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 500
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return {
        rootCause: 'Analysis failed',
        isRetryable: true,
        retryStrategy: 'delayed',
        suggestedFix: 'Manual investigation needed',
        confidence: 0.0
      };
    }
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

module.exports = AIFailureAnalyzer;