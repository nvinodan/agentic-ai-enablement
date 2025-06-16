# IT Support Chatbot Frontend

A React-based frontend for the IT Support Chatbot application. This application provides a user-friendly interface for interacting with the IT support bot that leverages a Retrieval-Augmented Generation (RAG) system on the backend.

## Features

- **Clean Chat Interface**: Modern, responsive chat UI with message history
- **Real-time Interaction**: Immediate feedback with loading indicators
- **Auto-scrolling**: Automatically scrolls to the latest messages
- **Adaptive Text Input**: Textarea that resizes based on content
- **Error Handling**: Graceful error display for failed requests

## Screenshots

(Screenshots to be added)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chatbot-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. The frontend is configured to proxy API requests to the backend running on port 3000. Make sure the backend server is running before starting the frontend.

## Usage

1. Start the development server:
   ```
   npm start
   ```

2. The application will be available at `http://localhost:3001`

3. Type your IT support questions in the chat interface and receive responses from the AI assistant.

## How It Works

1. **User Input**: Users type IT support questions in the chat interface
2. **API Communication**: The frontend sends requests to the backend API
3. **Response Rendering**: Responses from the AI are displayed in the chat interface
4. **State Management**: React state manages the chat history and UI state

## Project Structure

```
chatbot-frontend/
├── public/                  # Public assets
├── src/
│   ├── components/
│   │   ├── Chat.js          # Main chat component
│   │   └── Chat.css         # Chat component styles
│   ├── services/
│   │   └── chatService.js   # API communication service
│   ├── App.js               # Main application component
│   ├── App.css              # Application styles
│   ├── index.js             # Application entry point
│   └── variables.css        # CSS variables
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## Dependencies

- **React**: UI library for building the interface
- **React DOM**: React rendering for web browsers
- **React Scripts**: Configuration and scripts for Create React App

## Backend Integration

This frontend connects to a Node.js backend that implements a Retrieval-Augmented Generation (RAG) system. The backend processes IT support documentation and uses Azure OpenAI's GPT-4o to generate contextually relevant responses.

For more information about the backend, see the [backend README](../chatbot-backend/README.md).

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App configuration

## License

ISC
