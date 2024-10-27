FROM jenkins/jenkins:lts

USER root

# Update package list
RUN apt-get update

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Create MongoDB data and log directories
RUN mkdir -p /data/db /data/logs && \
    chown -R jenkins:jenkins /data

# Set permissions for jenkins user
RUN mkdir -p /var/jenkins_home/workspace/Be-Runcon && \
    chown -R jenkins:jenkins /var/jenkins_home/workspace/Be-Runcon && \
    chmod -R 775 /var/jenkins_home/workspace/Be-Runcon

# Set working directory
WORKDIR /var/jenkins_home/workspace/Be-Runcon

# Copy application files into the Docker container and install dependencies
COPY --chown=jenkins:jenkins . .
RUN npm install

USER jenkins