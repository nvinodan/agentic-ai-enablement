/**
 * Chat Service
 * Handles the business logic for chat functionality with RAG
 */
import { invoke } from './llm.js';
import { searchDocuments } from './documentService.js';

// System prompt for RAG
const SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based ONLY on the provided context.
If the provided context doesn't contain the information needed to answer the question, say "I don't have enough information to answer that question."
Do not use any prior knowledge beyond what is provided in the context.
Always cite the source of your information from the provided context.
Respond in plain text without any Markdown formatting.`;

/**
 * Process a chat request by invoking the LLM with RAG
 * @param {string} prompt - The user's prompt to send to the LLM
 * @returns {Promise<string>} - The LLM response content
 */
export async function processChat(prompt) {
  if (!prompt) {
    throw new Error('Prompt is required');
  }
  
  try {
    // Search for relevant documents
    const relevantDocs = await searchDocuments(prompt);
    
    // Extract content from relevant documents
    const context = relevantDocs.map(doc => {
      return `Source: ${doc.metadata.source}, Page: ${doc.metadata.loc?.pageNumber || 'unknown'}\n${doc.pageContent}`;
    }).join('\n\n');
    
    // Format the messages with system prompt, context, and user prompt
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Context information is below.\n\n${context}\n\nGiven the context information and not prior knowledge, answer the following question: ${prompt}` }
    ];
    
    // Invoke the LLM with the messages
    const response = await invoke(messages);
    const content = response.content || '';
    
    return content;
  } catch (error) {
    console.error('Error in chat service:', error);
    throw new Error('Failed to process chat request');
  }
}
