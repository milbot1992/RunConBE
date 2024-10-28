pipeline {
    agent any

    environment {
        MONGO_DB_PATH = "/data/db"
        MONGO_LOG_PATH = "/data/logs/mongo.log"
        MONGODB_URI = credentials('mongodb-uri')
    }

    stages {

        stage('Preparation') {
            steps {
                checkout scm
                sh "git rev-parse --short HEAD > .git/commit-id"
                script {
                    commit_id = readFile('.git/commit-id').trim()
                }
            }
        }

        stage('Initialise MongoDB') {
            steps {
                script {
                    sh '''
                        mkdir -p ${MONGO_DB_PATH} ${MONGO_LOG_PATH%/*}
                        mongod --dbpath ${MONGO_DB_PATH} --logpath ${MONGO_LOG_PATH} --fork
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
                script {
                    sh 'npm install'
                    sh 'npm run test'
                }
            }
        }

        stage('docker build/push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                        def app = docker.build("milbot1992/be-runcon:${commit_id}", '.')
                        app.push()
                    }
                }
            }
        }
    }
}
