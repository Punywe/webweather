pipeline {
    agent any

    environment {
        WEATHER_DEPLOY_DIR        = credentials('WEATHER_DEPLOY_DIR')
        WEATHER_SERVER_HEALTH_URL = credentials('WEATHER_SERVER_HEALTH_URL')
        BRANCH_NAME               = "main"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment Info') {
            steps {
                sh '''
                    echo "===== Jenkins Environment ====="
                    echo "Workspace   : $WORKSPACE"
                    echo "Branch      : $BRANCH_NAME"
                    echo "Deploy Dir  : $WEATHER_DEPLOY_DIR"
                    echo "Health URL  : $WEATHER_SERVER_HEALTH_URL"
                    echo "Deploy Dir exists: $([ -d "$WEATHER_DEPLOY_DIR" ] && echo YES || echo NO)"
                    echo "==============================="
                '''
            }
        }

        stage('Test Backend') {
            steps {
                sh '''
                    docker run --rm \
                        -v $PWD/Backend:/app \
                        -w /app \
                        python:3.11-slim \
                        sh -c "pip install --quiet -r requirements.txt && python -m compileall backend_web/ backend_db/ shared/ -q"
                '''
            }
        }

        stage('Test Frontend') {
            steps {
                sh '''
                    docker run --rm \
                        -v npm-cache:/root/.npm \
                        -v $PWD/Frontend/weather2:/app \
                        -w /app \
                        node:20-alpine \
                        sh -c "npm install --silent && npm run build"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    cp $WEATHER_DEPLOY_DIR/.env $WORKSPACE/.env &&
                    docker compose -p webweather build --no-cache &&
                    docker compose -p webweather up -d --remove-orphans &&
                    docker image prune -f
                '''
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def retries = 10
                    def delay = 10

                    retry(retries) {
                        sleep(delay)
                        def response = sh(
                            script: 'curl -sf $WEATHER_SERVER_HEALTH_URL/docs -o /dev/null -w \'%{http_code}\'',
                            returnStdout: true
                        ).trim()

                        if (response != '200') {
                            error("Health check failed — HTTP ${response}")
                        }
                        echo "Health check passed — HTTP ${response}"
                    }
                }
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    echo "===== Container Status =====" &&
                    docker compose -p webweather ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded on branch: ${BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed on branch: ${BRANCH_NAME}"
        }
        always {
            cleanWs()
        }
    }
}
