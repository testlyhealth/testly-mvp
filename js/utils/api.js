import { resolveApiPath } from '../config.js';

/**
 * Makes a fetch request with proper error handling
 * @param {string} path - The API path to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function fetchApi(path, options = {}) {
  try {
    const response = await fetch(resolveApiPath(path), options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
}

/**
 * Makes a GET request to the API
 * @param {string} path - The API path to fetch
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function get(path) {
  return fetchApi(path);
}

/**
 * Makes a POST request to the API
 * @param {string} path - The API path to post to
 * @param {Object} data - The data to send
 * @returns {Promise<any>} - The parsed JSON response
 */
export async function post(path, data) {
  return fetchApi(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
} 