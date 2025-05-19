// Configuration for different environments
const config = {
  // Base path for all API calls and assets
  basePath: window.location.hostname === 'testly-mvp.github.io' 
    ? '/testly-mvp'  // GitHub Pages
    : '',  // Local development

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
  return `${config.basePath}${path}`;
}

// Export the config
export default config; 