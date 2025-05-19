// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isGitHubPages = window.location.hostname.includes('github.io');

// Base URL configuration
const config = {
  baseUrl: isDevelopment ? '' : '/Draft-3', // Adjust this to match your GitHub Pages repository name
  apiBaseUrl: isDevelopment ? '' : '/Draft-3',
  environment: isDevelopment ? 'development' : 'production'
};

// Path resolution utility
export function resolvePath(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine with base URL
  return `${config.baseUrl}/${cleanPath}`;
}

// API path resolution
export function resolveApiPath(path) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.apiBaseUrl}/${cleanPath}`;
}

// Export configuration
export default config; 