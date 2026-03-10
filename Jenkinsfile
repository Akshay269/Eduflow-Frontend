pipeline {
    agent any

    environment {
        S3_BUCKET = 'eduflow-frontend'
        AWS_REGION = 'ap-south-1'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out frontend code...'
                checkout scm
            }
        }

        stage('Deploy to S3') {
            steps {
                echo '📦 Uploading to S3...'
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY'),
                    string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY
                        export AWS_DEFAULT_REGION=ap-south-1

                        aws s3 sync . s3://eduflow-frontend \
                            --delete \
                            --exclude ".git/*" \
                            --exclude "Jenkinsfile"
                    '''
                }
            }
        }

        stage('Invalidate CloudFront') {
            steps {
                echo '🔄 Invalidating CloudFront cache...'
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY'),
                    string(credentialsId: 'AWS_SECRET_KEY', variable: 'AWS_SECRET_KEY'),
                    string(credentialsId: 'CLOUDFRONT_DISTRIBUTION_ID', variable: 'CF_ID')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY
                        export AWS_DEFAULT_REGION=ap-south-1

                        aws cloudfront create-invalidation \
                            --distribution-id $CF_ID \
                            --paths "/*"
                    '''
                }
            }
        }
    }


    post {
        success {
            echo '✅ Frontend deployed successfully!'
        }
        failure {
            echo '❌ Frontend deployment failed!'
        }
    }
}