pipeline {
    agent any

    environment {
        // Container paths
        MONGO_DB_PATH = "/data/db"
        MONGO_LOG_PATH = "/data/logs/mongo.log"
        NODE_ENV = 'test'
        VERCEL_TOKEN = credentials('vercel-token')
        MONGODB_URI = credentials('mongodb-uri')
    }

    stages {

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
                // Test results reporting
                sh 'npm run test || exit 1'
                junit 'test-results/*.xml' 
            }
        }

        stage('Deploy to Vercel') {
            when {
                expression { 
                    return env.BRANCH_NAME == 'main' && currentBuild.resultIsBetterOrEqualTo('SUCCESS')
                }
            }
            steps {
                // Deployment verification
                sh '''
                    vercel pull --yes --environment=production --token=$VERCEL_TOKEN
                    vercel build --prod --token=$VERCEL_TOKEN
                    vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
                '''
            }
        }
    }

}