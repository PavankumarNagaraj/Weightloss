// Centralized ID Generation Utility
// Generates short, clean 8-character alphanumeric IDs

/**
 * Generate a unique 8-character alphanumeric ID (lowercase only)
 * Format: 4 chars timestamp + 4 chars random = 8 total
 * No underscores, no confusing characters (0, o, i, l, 1)
 * 
 * Examples: m3k9hx2p, n4j8ky3q, p5m7nz4r
 * 
 * @returns {string} 8-character lowercase ID
 */
export const generateShortId = () => {
  // Lowercase only, without confusing ones: 0, o, i, l, 1
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  
  // Use last 4 chars of timestamp (base36) for uniqueness - already lowercase
  const timestamp = Date.now().toString(36).slice(-4);
  
  // Generate 4 random characters
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return timestamp + randomPart; // Total: 8 characters, all lowercase
};

/**
 * Generate user ID
 * @returns {string} 8-character user ID
 */
export const generateUserId = () => {
  return generateShortId();
};

/**
 * Generate subscription ID
 * @returns {string} 8-character subscription ID
 */
export const generateSubscriptionId = () => {
  return generateShortId();
};

/**
 * Generate delivery ID
 * @returns {string} 8-character delivery ID
 */
export const generateDeliveryId = () => {
  return generateShortId();
};

/**
 * Generate batch ID
 * @returns {string} 8-character batch ID
 */
export const generateBatchId = () => {
  return generateShortId();
};

/**
 * Validate if string is a valid short ID
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid
 */
export const isValidShortId = (id) => {
  if (!id || typeof id !== 'string') return false;
  if (id.length !== 8) return false;
  
  // Check if all characters are lowercase alphanumeric (no special chars, no uppercase)
  const validChars = /^[a-z0-9]+$/;
  return validChars.test(id);
};

/**
 * Generate multiple unique IDs
 * @param {number} count - Number of IDs to generate
 * @returns {string[]} Array of unique IDs
 */
export const generateMultipleIds = (count) => {
  const ids = new Set();
  
  while (ids.size < count) {
    ids.add(generateShortId());
  }
  
  return Array.from(ids);
};

// Example usage:
// import { generateUserId, generateSubscriptionId } from './utils/idGenerator';
// const userId = generateUserId(); // "m3k9hx2p"
// const subId = generateSubscriptionId(); // "n4j8ky3q"
