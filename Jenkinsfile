pipeline {
    agent any
    
    parameters {
        string(name: 'VPS_IP', defaultValue: '72.60.99.67', description: 'VPS IP Address')
        string(name: 'VPS_USER', defaultValue: 'root', description: 'VPS Username')
        string(name: 'DEPLOY_PATH', defaultValue: '/var/www/html/test-reports', description: 'Deployment Path on VPS')
    }
    
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
                sh 'rm -rf allure-results logs || true'
                sh 'mkdir -p allure-results logs'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'docker run --rm -v $(pwd)/allure-results:/app/allure-results -v $(pwd)/logs:/app/logs playwright-framework:latest'
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
        
        stage('Deploy to Hostinger VPS') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'hostinger-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    script {
                        def timestamp = new Date().format('yyyy-MM-dd_HH-mm-ss')
                        def buildFolder = "build-${BUILD_NUMBER}-${timestamp}"
                        
                        sh """
                            # Create timestamped folder
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "mkdir -p ${params.DEPLOY_PATH}/${buildFolder}"

                            # Copy current report to timestamped folder
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r allure-report/* ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/${buildFolder}/
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r logs ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/${buildFolder}/

                            # Copy to latest folder (overwrite)
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "mkdir -p ${params.DEPLOY_PATH}/latest"
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r allure-report/* ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/latest/
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r logs ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/latest/
                        """
                    }
                }
            }
        }
        
        stage('Generate Index Page') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'hostinger-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        # Copy template and script to VPS
                        scp -i \$SSH_KEY -o StrictHostKeyChecking=no index-template.html ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/
                        scp -i \$SSH_KEY -o StrictHostKeyChecking=no generate-index.sh ${params.VPS_USER}@${params.VPS_IP}:${params.DEPLOY_PATH}/
                        
                        # Execute script on VPS
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no ${params.VPS_USER}@${params.VPS_IP} "chmod +x ${params.DEPLOY_PATH}/generate-index.sh && ${params.DEPLOY_PATH}/generate-index.sh ${BUILD_NUMBER} ${params.DEPLOY_PATH}"
                    """
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'logs/**', allowEmptyArchive: true
        }
    }
}