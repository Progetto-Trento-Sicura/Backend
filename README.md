# TrentoSicura Backend

Backend API server for the TrentoSicura project, built with Node.js and Express.

## Project Structure

```
Backend/
├── controllers/     # Logic for handling incoming requests and returning responses
├── middleware/      # Functions that process requests before they reach route handlers
├── models/         # Data structures and database interactions
├── routes/         # API endpoints and their corresponding handlers
├── test/           # Unit and integration tests for code quality assurance
├── utils/          # Utility functions used across the application
└── api-docs.yaml   # API specifications with endpoints, parameters, and response formats
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Progetto-TrentoSicura/Backend.git
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

The server will start and be available at the configured port (typically http://localhost:3000).

## Testing

To run the test suite:

```bash
npm test
```

The test suite includes both unit and integration tests to ensure code quality and functionality.

## API Documentation

API specifications are available in the `api-docs.yaml` file. This file contains:
- Available endpoints
- Request parameters
- Response formats
- Authentication requirements

## Development

### Project Architecture

This backend follows a modular architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses, orchestrating business logic
- **Middleware**: Process requests for authentication, validation, logging, etc.
- **Models**: Define data structures and handle database operations
- **Routes**: Define API endpoints and connect them to appropriate controllers
- **Utils**: Provide reusable utility functions and helpers


**TrentoSicura** - Making Trento safer through technology