pipeline {
    agent any

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
