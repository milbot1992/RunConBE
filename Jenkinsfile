pipeline {
    agent any

    environment {
        // Container paths
        MONGO_DB_PATH = "/data/db"
        MONGO_LOG_PATH = "/data/logs/mongo.log"
        MONGODB_URI = credentials('mongodb-uri')
    }

    stages {

        stage('Preparation') {
            steps {
                checkout scm
                sh "git rev-parse --short HEAD > .git/commit-id"
                commit_id = radFile('.git/commit-id').trim()
                }
        }

        stage('Initialise MongoDB') {
            steps {
                script {
                    // Error handling and health check
                    sh '''
                        mkdir -p ${MONGO_DB_PATH} ${MONGO_LOG_PATH%/*}
                        mongod --dbpath ${MONGO_DB_PATH} --logpath ${MONGO_LOG_PATH} --fork
                        # Wait for MongoDB to be ready
                        for i in {1..30}; do
                            if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
                                echo "MongoDB is ready"
                                exit 0
                            fi
                            sleep 1
                        done
                        echo "MongoDB failed to start"
                        exit 1
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                nodejs(nodeJSInstallationName: 'nodejs') {
                    sh 'npm install'
                    sh 'npm run test'
                }
            }
        }

        stage('docker build/push') {
            docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                def app = docker.build("milbot1992/be-runcon:${commit_id}", '.').push()
            }
        }

    }
}