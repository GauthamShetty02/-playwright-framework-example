pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t playwright-tests .'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'docker run --rm -v $(pwd)/playwright-report:/app/playwright-report playwright-tests'
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