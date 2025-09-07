import fs from 'fs';
import path from 'path';

export class AllureAIReporter {
  static addAIAnalysisToReport(analysis, attempt) {
    const allureResultsDir = './allure-results';
    
    // Ensure directory exists
    if (!fs.existsSync(allureResultsDir)) {
      fs.mkdirSync(allureResultsDir, { recursive: true });
    }
    
    // Create AI analysis attachment
    const attachmentName = `ai-analysis-${Date.now()}.json`;
    const attachmentPath = path.join(allureResultsDir, attachmentName);
    
    const aiReport = {
      name: "AI Failure Analysis",
      type: "application/json",
      source: attachmentName,
      timestamp: new Date().toISOString(),
      buildAttempt: attempt,
      analysis: {
        rootCause: analysis.rootCause,
        isRetryable: analysis.isRetryable,
        retryStrategy: analysis.retryStrategy,
        confidence: analysis.confidence,
        suggestedFix: analysis.suggestedFix,
        failedTests: analysis.failedTests || []
      }
    };
    
    fs.writeFileSync(attachmentPath, JSON.stringify(aiReport, null, 2));
    
    // Create environment properties for Allure
    const envPath = path.join(allureResultsDir, 'environment.properties');
    const envContent = `
AI.Analysis.Enabled=true
AI.Analysis.Provider=Groq
AI.Analysis.Model=llama3-8b-8192
AI.Analysis.Confidence=${(analysis.confidence * 100).toFixed(1)}%
AI.Analysis.Retryable=${analysis.isRetryable}
AI.Analysis.Strategy=${analysis.retryStrategy}
Build.Attempt=${attempt}
    `.trim();
    
    fs.writeFileSync(envPath, envContent);
    
    return attachmentName;
  }
  
  static createTestSummary(totalTests, passedTests, failedTests, aiAnalysis) {
    const summaryPath = './allure-results/test-summary.json';
    
    const summary = {
      timestamp: new Date().toISOString(),
      testExecution: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
      },
      aiInsights: {
        analysisPerformed: !!aiAnalysis,
        rootCause: aiAnalysis?.rootCause || 'N/A',
        retryRecommendation: aiAnalysis?.isRetryable ? 'Recommended' : 'Not Recommended',
        confidence: aiAnalysis ? `${(aiAnalysis.confidence * 100).toFixed(1)}%` : 'N/A'
      }
    };
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }
}

export default AllureAIReporter;