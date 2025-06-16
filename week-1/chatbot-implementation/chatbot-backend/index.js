import express from 'express';
import { handleChatRequest } from './controllers/chatController.js';
import { initializeDocumentService } from './services/documentService.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Basic middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Chat route - handled by the chat controller
app.post('/api/chat', handleChatRequest);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize document service and start the server
initializeDocumentService()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize document service:', error);
    console.log('Server starting without document service...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without document service)`);
    });
  });

export default app;
