pipeline {
    agent any

    environment {
        // Declare variable to hold the Mongo URI
        MONGODB_URI = credentials('MONGODB_URI')
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

        stage('Start MongoDB') {
            steps {
                script {
                    sh 'docker-compose up -d mongodb'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Stop MongoDB') {
            steps {
                script {
                    sh 'docker-compose down'
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
