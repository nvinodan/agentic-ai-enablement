/**
 * Chat Controller
 * Handles HTTP requests related to chat functionality
 */
import { processChat } from '../services/chatService.js';

/**
 * Handle chat request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function handleChatRequest(req, res) {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    try {
      const response = await processChat(prompt);
      res.status(200).json({ response });
    } catch (serviceError) {
      console.error('Chat service error:', serviceError);
      res.status(503).json({ 
        error: 'Chat service unavailable',
        message: serviceError.message || 'Failed to process chat request'
      });
    }
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
