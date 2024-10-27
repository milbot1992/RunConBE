FROM jenkins/jenkins:lts

USER root

# Update package list
RUN apt-get update

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy application files into the Docker container
WORKDIR /var/jenkins_home/workspace/Be-Runcon
COPY . .

USER jenkins