/**
 * Chat Service
 * Handles API calls to the backend chat service
 */

/**
 * Send a chat message to the backend API
 * @param {string} prompt - The user's message to send to the API
 * @returns {Promise<Object>} - The API response
 */
export const sendChatMessage = async (prompt) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get response from chat API');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
