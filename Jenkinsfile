pipeline {
    agent 'any'
    
    environment {
        DOCKER_USER = 'alifarhan3311'
        FRONTEND_IMAGE = 'visionpro-frontend'
        BACKEND_IMAGE = 'visionpro-backend'
        IMAGE_TAG = 'latest'
    }

    stages {
        stage('Pull From Git') {
            steps {
                echo 'Pulling from github'
                git url: "https://github.com/alifarhan3311/visionprorefurbishing.git", branch:"main"
                echo "clone successfully"
            }
        }
        
         stage('Build Docker Images') {
            steps {
                echo 'Start Build'
                dir('frontend'){
                    echo 'Frontend build satrt'
                sh "docker build -t alifarhan3311/visionpro-frontend:latest ."
                echo 'Frontend build completed'
                }
                
                dir('backend'){
                      echo 'Backend build satrt'
                sh "docker build -t alifarhan3311/visionpro-backend:latest ."
                echo 'Backend build completed'
                }
              
            }
        }
        
        stage('Push Images to Docker Hub') {
            steps {
                echo 'Starting push to Docker Hub'
                withCredentials([usernamePassword(credentialsId: "DockerHubCred", 
                                                 usernameVariable: 'D_USER', 
                                                 passwordVariable: 'D_PASS')]) {
                    
                    // Login
                    sh "echo ${D_PASS} | docker login -u ${D_USER} --password-stdin"
                    
                    // Push Frontend
                    sh "docker push ${DOCKER_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    
                    // Push Backend
                    sh "docker push ${DOCKER_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                    
                    echo 'Images pushed successfully'
                }
            }
        }
        
        stage('Deploy on Server') {
            steps {
                echo 'Deploying via Docker Compose...'
                sh "docker-compose down"
                sh "docker-compose pull"
                sh "docker-compose up -d"
                echo 'Deployment Finished!'
            }
        }
    }
    post {
        always {
            echo "clean extra images"
            sh "docker image prune -f"
        }
    }
}
