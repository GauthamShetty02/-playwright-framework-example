pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                sh '''
                    if ! npm list -g playwright-test-framework-advanced &>/dev/null; then
                        npm install -g playwright-test-framework-advanced@^1.0.0
                        npx playwright install --with-deps || npx playwright install
                    fi
                '''
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npx playwright test'
            }
        }
        
        stage('Generate Report') {
            steps {
                echo 'Report generated in playwright-report directory'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}