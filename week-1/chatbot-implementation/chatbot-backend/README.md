# ChatBot

A Retrieval-Augmented Generation (RAG) chatbot backend built with Node.js and Express. This system processes PDF documents and uses Azure OpenAI's GPT-4o to generate contextually relevant responses based on the document content.

## Features

- **Document Processing**: Automatically loads and processes PDF documents
- **Text Chunking**: Splits documents into manageable chunks for better retrieval
- **Keyword-Based Search**: Finds relevant document chunks based on user queries
- **RAG Implementation**: Enhances LLM responses with retrieved document context
- **RESTful API**: Simple Express-based API for chat interactions

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chatbot-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   AZURE_OPENAI_INSTANCE_NAME=your-instance-name
   AZURE_OPENAI_API_KEY=your-api-key
   AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
   AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME=your-embedding-deployment-name
   AZURE_OPENAI_VERSION=your-api-version
   PORT=3000
   ```
   
   Note: If `AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME` is not provided, the system will use `AZURE_OPENAI_DEPLOYMENT_NAME` for embeddings.

## Usage

1. Add your PDF documents to the `docs` directory. The system will recursively find and process all PDFs in this directory.

2. Start the server:
   ```
   npm start
   ```

3. The server will run on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Test Endpoint

```
GET /api/test
```

Returns a simple JSON response to verify the API is working.

### Chat Endpoint

```
POST /api/chat
```

**Request Body:**
```json
{
  "prompt": "Your question here"
}
```

**Response:**
```json
{
  "response": "AI-generated response based on document context"
}
```

## How It Works

1. **Document Loading**: The system loads PDF documents from the `docs` directory during initialization.
2. **Document Processing**: Documents are split into chunks with overlap for better context preservation.
3. **Vector Embeddings**: Document chunks are embedded using Azure OpenAI's embedding model to create vector representations.
4. **Vector Storage**: The embeddings are stored in a FAISS vector database for efficient similarity search.
5. **Query Processing**: When a user sends a prompt, the system searches for relevant document chunks using vector similarity.
6. **Context Enhancement**: The system formats a prompt with the retrieved document context.
7. **LLM Generation**: The enhanced prompt is sent to Azure OpenAI's GPT-4o model.
8. **Response**: The model's response is returned to the user.

## Project Structure

```
chatbot-backend/
├── controllers/
│   └── chatController.js    # Handles HTTP requests for chat
├── docs/                    # Directory for PDF documents
├── services/
│   ├── chatService.js       # Implements RAG functionality
│   ├── documentService.js   # Handles document loading and retrieval
│   └── llm.js               # Interfaces with Azure OpenAI
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── index.js                 # Main application entry point
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## Dependencies

- **@langchain/community**: LangChain community components
- **@langchain/openai**: LangChain OpenAI integration
- **chromadb**: Vector database for document storage
- **dotenv**: Environment variable management
- **express**: Web server framework
- **faiss-node**: Vector similarity search library for efficient embedding retrieval
- **langchain**: LLM application framework
- **pdf-parse**: PDF document parsing
- **uuid**: Unique identifier generation

## License

ISC
