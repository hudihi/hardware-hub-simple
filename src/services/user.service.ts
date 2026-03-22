// User service for anonymous ID generation and management
// Follows SOLID principles - single responsibility for user identification

// Constants for storage keys
const STORAGE_KEYS = {
  USER_ID: 'pahala_user_id',
  SESSION_ID: 'pahala_session_id'
} as const;

/**
 * Generate UUID v4 using crypto.randomUUID with fallback
 * @returns UUID string
 */
const generateUUID = (): string => {
  // Use modern crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers - RFC 4122 compliant UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Get or create a unique user ID for this browser tab
 * Each tab gets its own unique ID to prevent conflicts
 * @returns User ID string
 */
export const getOrCreateUserId = (): string => {
  try {
    // Check if tab-specific ID exists in sessionStorage (unique per tab)
    let tabUserId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
    
    if (tabUserId && tabUserId.trim() !== '') {
      console.log('Using existing tab user ID:', tabUserId);
      return tabUserId;
    }

    // Generate new unique ID for this tab
    tabUserId = generateUUID();
    sessionStorage.setItem(STORAGE_KEYS.USER_ID, tabUserId);
    
    // Also store in localStorage for persistence (backup)
    localStorage.setItem(STORAGE_KEYS.USER_ID, tabUserId);
    
    console.log('Generated new tab user ID:', tabUserId);
    return tabUserId;
  } catch (error) {
    console.error('Error managing user ID:', error);
    // Fallback: generate temporary ID
    return generateUUID();
  }
};

/**
 * Get or create a session ID (unique per tab)
 * @returns Session ID string
 */
export const getOrCreateSessionId = (): string => {
  try {
    // Check if session ID exists in sessionStorage
    let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    
    if (sessionId && sessionId.trim() !== '') {
      return sessionId;
    }

    // Generate new session ID
    sessionId = generateUUID();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    
    return sessionId;
  } catch (error) {
    console.error('Error managing session ID:', error);
    return generateUUID();
  }
};

/**
 * Reset user ID (for testing or privacy)
 * Generates new ID and stores it
 * @returns New user ID string
 */
export const resetUserId = (): string => {
  try {
    const newUserId = generateUUID();
    localStorage.setItem(STORAGE_KEYS.USER_ID, newUserId);
    console.log('Reset user ID to:', newUserId);
    return newUserId;
  } catch (error) {
    console.error('Error resetting user ID:', error);
    return generateUUID();
  }
};

/**
 * Check if user ID exists
 * @returns True if user ID is stored
 */
export const hasUserId = (): boolean => {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return !!(userId && userId.trim() !== '');
  } catch (error) {
    console.error('Error checking user ID:', error);
    return false;
  }
};

/**
 * Get current user ID without creating one
 * @returns User ID string or null if none exists
 */
export const getUserId = (): string | null => {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return (userId && userId.trim() !== '') ? userId : null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Export storage keys for potential use elsewhere
export { STORAGE_KEYS };

export default {
  getOrCreateUserId,
  getOrCreateSessionId,
  resetUserId,
  hasUserId,
  getUserId,
  STORAGE_KEYS
};
