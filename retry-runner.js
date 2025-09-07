import { execSync } from 'child_process';
import AIFailureAnalyzer from './ai-analyzer.js';
import fs from 'fs';

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
        execSync('npx playwright test --reporter=dot,allure-playwright', { 
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
          
          const analysisReport = `
🤖 ===== AI FAILURE ANALYSIS REPORT =====
🔴 Root Cause: ${lastAnalysis.rootCause}
🔄 Retryable: ${lastAnalysis.isRetryable ? 'YES' : 'NO'}
🎯 Strategy: ${lastAnalysis.retryStrategy.toUpperCase()}
📊 Confidence: ${(lastAnalysis.confidence * 100).toFixed(1)}%
🔧 Suggested Fix: ${lastAnalysis.suggestedFix}
========================================
`;
          
          console.log(analysisReport);
          
          // Write AI analysis to log file
          fs.appendFileSync('./logs/ai-analysis.log', `\n[${new Date().toISOString()}] Build Attempt ${attempt}\n${analysisReport}`);
          
          // Decide if we should retry
          const shouldRetry = await this.analyzer.shouldRetry(lastAnalysis, attempt);
          
          if (shouldRetry && attempt < this.maxRetries) {
            const delay = this.analyzer.getRetryDelay(lastAnalysis.retryStrategy, attempt);
            
            console.log(`🔄 AI recommends retry with ${lastAnalysis.retryStrategy} strategy`);
            if (delay > 0) {
              console.log(`⏳ Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            attempt++;
            continue;
          } else {
            console.log(`🚫 AI analysis: No retry recommended (Attempt ${attempt}/${this.maxRetries})`);
          }
        } else {
          console.log('⚠️ No log file found for AI analysis');
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
if (import.meta.url === `file://${process.argv[1]}`) {
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

export default SmartRetryRunner;