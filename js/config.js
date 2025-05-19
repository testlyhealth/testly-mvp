// Configuration for different environments
const config = {
  // Detect if we're running on GitHub Pages
  isGitHubPages: window.location.hostname.includes('github.io'),
  
  // Get the repository name from the path
  getRepoName() {
    if (!this.isGitHubPages) return '';
    const pathParts = window.location.pathname.split('/');
    return pathParts[1] || ''; // First non-empty part of the path
  },

  // Base path for all API calls and assets
  get basePath() {
    if (!this.isGitHubPages) return '/';  // Use root path for local development
    const repoName = this.getRepoName();
    return repoName ? `/${repoName}/` : '/';
  },

  // API endpoints
  endpoints: {
    providers: 'data/providers.json',
    biomarkerGroupings: 'data/biomarker-groupings.json',
    tests: 'data/tests.json',
    categories: 'data/categories.json'
  }
};

// Helper function to get full URL
export function getUrl(path) {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.basePath}${normalizedPath}`;
}

// Export the config
export default config; 