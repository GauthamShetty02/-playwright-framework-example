pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Load Docker Image') {
            steps {
                copyArtifacts projectName: 'playwright-docker-builder', selector: lastSuccessful()
                sh 'docker load < playwright-framework.tar'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'docker run --rm -v $(pwd)/playwright-report:/app/playwright-report playwright-framework:latest'
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