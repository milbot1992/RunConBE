pipeline {
    agent {
        docker {
            image 'docker:git'  // This image includes Docker and Docker Compose
            args '-u root'       // Run as root for necessary permissions
        }
    }

    environment {
        MONGO_DB_PATH = "${WORKSPACE}/data/db"
        MONGO_LOG_PATH = "${WORKSPACE}/data/logs/mongo.log"
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

        stage('Build and Run Docker Compose') {
            steps {
                script {
                    sh 'docker-compose up -d --build'  // Start the app container using the external MongoDB URI
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

        stage('Docker Build/Push') {
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
