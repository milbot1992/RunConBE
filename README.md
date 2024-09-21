# Backend Runcon

### Description
This project is an Express-based API for managing user groups, chat messages, posts, pictures, runs, and users. The API allows users to interact with groups, manage messages in chats, view and upload pictures, handle posts, and retrieve run details. It uses MongoDB for data storage and provides RESTful endpoints for seamless interaction.

The API supports cross-origin resource sharing (CORS), making it suitable for front-end and mobile app integrations. It includes error handling for both general and MongoDB-specific issues, ensuring robust and clear responses.

### Project Structure

## Project Structure

- **__tests__/**  
  Unit and integration tests for the API

- **app/**  
  Main application logic  
  - **controllers/**  
    Business logic for various entities (chats, groups, messages, etc.)  
    - `chats_controller.js`  
    - `groups_controller.js`  
    - `messages_controller.js`  
    - `pictures_controller.js`  
    - `posts_controller.js`  
    - `runs_controller.js`  
    - `users_controller.js`  
  - **models/**  
    Models for MongoDB collections
    - `chats_model.js`  
    - `groups_model.js`  
    - `messages_model.js`  
    - `pictures_model.js`  
    - `posts_model.js`  
    - `runs_model.js`  
    - `users_model.js`  
  - **routes/**  
    API route definitions  
  - `app.js`  
    Main application entry point (Express app, middleware setup)  
  - `error-handler.js`  
    Error handling middleware for both general and MongoDB-related errors  

- **db/**  
  Database configuration and seeding  
  - **data/**  
    Static data for seeding and testing  
    - **development-data/** 
    - **test-data/** 
  - **seeds/**  
    Database seed scripts  
    - `run-seed.js`  
    - `seed.js`  

- `docker-compose.yml`  
  Docker configuration for containerised environment  

- `Dockerfile`  
  Dockerfile for building the application image  

- `connection.js`  
  MongoDB connection logic  

- `endpoints.json`  
  List of all API endpoints with descriptions and example responses  


### Features:
- **Group Management**: Create, retrieve, update, and delete groups.
- **Chat Management**: Fetch, send, and update messages in group chats.
- **Message Handling**: Post messages, edit messages, delete messages and mark messages as read.
- **Post Management**: Serve posts with picture URLs.
- **Picture Management**: Upload and retrieve images.
- **User Runs**: Fetch and display run information.
- **User Data**: Manage user profiles, group memberships, and activity.

### Getting Started

1. **Clone the repository:**
   ```
   git clone <repository-url>
   ```

2. **Install dependencies:**

```npm install```

3. **Run the application:**

```npm start```

4. **Environment Variables: Ensure MongoDB connection and environment variables are configured in a .env file as follows:**

```
MONGO_URI=<your-mongodb-connection-string>
PORT=<port-number>
```

5. **Docker Support: To run the application in a Docker container:**

- Build the Docker image:
```
docker build -t group-api
```

- Run the Docker container:
```
docker-compose up
```

### Endpoints
The list of available endpoints and example responses can be viewed in the endpoints.json file.

### Error Handling
The project has robust error handling middleware that manages both general and MongoDB-related errors. Errors are returned with structured messages, making it easier for developers to understand and debug issues.

### Technologies Used
- Node.js with Express for server-side API development.
- MongoDB for NoSQL database management.
- Docker for containerised application deployment.
- Postman for API testing.
