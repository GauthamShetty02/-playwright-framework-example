const { execSync } = require('child_process');
const AIFailureAnalyzer = require('./ai-analyzer');
const fs = require('fs');

class SmartRetryRunner {
  constructor() {
    this.analyzer = new AIFailureAnalyzer();
    this.maxRetries = 3;
  }

  async runTestsWithAIRetry() {
    let attempt = 1;
    let lastAnalysis = null;

    while (attempt <= this.maxRetries) {
      console.log(`\n🤖 AI Test Execution - Attempt ${attempt}/${this.maxRetries}`);
      
      try {
        // Run tests
        execSync('npx playwright test', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        console.log('✅ Tests passed successfully!');
        return { success: true, attempts: attempt };
        
      } catch (error) {
        console.log(`❌ Tests failed on attempt ${attempt}`);
        
        // Analyze failure logs
        const logPath = './logs/combined.log';
        if (fs.existsSync(logPath)) {
          console.log('🔍 Analyzing failure with AI...');
          lastAnalysis = await this.analyzer.analyzeFailureLogs(logPath);
          
          console.log(`📊 AI Analysis:
            Root Cause: ${lastAnalysis.rootCause}
            Retryable: ${lastAnalysis.isRetryable}
            Strategy: ${lastAnalysis.retryStrategy}
            Confidence: ${(lastAnalysis.confidence * 100).toFixed(1)}%
            Fix: ${lastAnalysis.suggestedFix}`);
          
          // Decide if we should retry
          const shouldRetry = await this.analyzer.shouldRetry(lastAnalysis, attempt);
          
          if (shouldRetry && attempt < this.maxRetries) {
            const delay = this.analyzer.getRetryDelay(lastAnalysis.retryStrategy, attempt);
            
            if (delay > 0) {
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            attempt++;
            continue;
          }
        }
        
        console.log('🚫 No more retries. Tests failed.');
        return { 
          success: false, 
          attempts: attempt, 
          analysis: lastAnalysis 
        };
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new SmartRetryRunner();
  runner.runTestsWithAIRetry()
    .then(result => {
      console.log('\n📋 Final Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Runner failed:', error);
      process.exit(1);
    });
}

module.exports = SmartRetryRunner;