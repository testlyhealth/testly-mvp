// Environment detection
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isGitHubPages = window.location.hostname.includes('github.io');

// Get the repository name from the path
const getRepoName = () => {
  if (!isGitHubPages) return '';
  const pathParts = window.location.pathname.split('/');
  // For testlyhealth.github.io/testly-mvp, we want 'testly-mvp'
  return pathParts[1] || 'testly-mvp'; // Default to testly-mvp if not found
};

// Base URL configuration
const config = {
  baseUrl: isDevelopment ? '' : `/${getRepoName()}`,
  apiBaseUrl: isDevelopment ? '' : `/${getRepoName()}`,
  environment: isDevelopment ? 'development' : 'production',
  debug: true // Enable debug logging
};

// Path resolution utility
export function resolvePath(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine with base URL
  const fullPath = `${config.baseUrl}/${cleanPath}`;
  
  if (config.debug) {
    console.log('Resolving path:', {
      original: path,
      cleanPath,
      baseUrl: config.baseUrl,
      fullPath
    });
  }
  
  return fullPath;
}

// API path resolution
export function resolveApiPath(path) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const fullPath = `${config.apiBaseUrl}/${cleanPath}`;
  
  if (config.debug) {
    console.log('Resolving API path:', {
      original: path,
      cleanPath,
      apiBaseUrl: config.apiBaseUrl,
      fullPath
    });
  }
  
  return fullPath;
}

// Export configuration
export default config; 