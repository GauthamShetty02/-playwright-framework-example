pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
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