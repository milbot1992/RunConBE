pipeline {
    agent any

    stages {

        stage('Check User') {
            steps {
                sh 'whoami'
                sh 'groups'
            }
        }

        stage("Verifying tooling") {
            steps {
                sh '''
                    docker version
                    docker info
                    docker compose version
                '''
            }
        }

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
                    nodejs(nodeJSInstallationName: 'nodejs') {
                        sh 'npm install'
                        sh 'npm test'
                    }
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
