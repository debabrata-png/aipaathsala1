// utils/roomUtils.js
export const generateAIChatRoom = (coursecode) => {
  if (!coursecode || typeof coursecode !== 'string') {
    throw new Error('Invalid coursecode provided');
  }
  
  // Sanitize coursecode: lowercase, remove non-alphanumeric
  const safeCourseCode = coursecode.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return `ai-chat-${safeCourseCode}`;
};
