pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Pull Docker Image') {
            steps {
                sh 'docker pull playwright-framework:latest || echo "Using local image"'
            }
        }
        
        stage('Cleanup Previous Results') {
            steps {
                sh 'rm -rf allure-results playwright-report combined.log || true'
                sh 'mkdir -p allure-results playwright-report'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'docker run --rm -v $(pwd)/allure-results:/app/allure-results -v $(pwd)/playwright-report:/app/playwright-report playwright-framework:latest'
            }
        }
        
        stage('Generate Allure Report') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    properties: [],
                    reportBuildPolicy: 'ALWAYS',
                    results: [[path: 'allure-results']]
                ])
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**, allure-results/**, combined.log', allowEmptyArchive: true
        }
    }
}