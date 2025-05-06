// Blood test data service
export class BloodTestService {
  constructor() {
    this.cache = new Map();
    this.baseUrl = '/data/blood-tests'; // Will be replaced with API endpoint later
  }

  async getBloodTests(filters = {}) {
    try {
      // For now, load from JSON
      const response = await fetch(`${this.baseUrl}/tests.json`);
      if (!response.ok) throw new Error('Failed to fetch blood tests');
      
      const data = await response.json();
      let tests = data.tests; // Get the tests array from the response
      
      // Apply filters
      if (filters.provider) {
        tests = tests.filter(test => test.provider === filters.provider);
      }
      if (filters.category) {
        tests = tests.filter(test => test.category === filters.category);
      }
      if (filters.priceRange) {
        tests = tests.filter(test => 
          test.price >= filters.priceRange.min && 
          test.price <= filters.priceRange.max
        );
      }
      
      return tests;
    } catch (error) {
      console.error('Error fetching blood tests:', error);
      throw error;
    }
  }

  async getProviders() {
    try {
      const response = await fetch(`${this.baseUrl}/providers.json`);
      if (!response.ok) throw new Error('Failed to fetch providers');
      const data = await response.json();
      return data.providers; // Get the providers array from the response
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${this.baseUrl}/categories.json`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories; // Get the categories array from the response
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Future methods for MySQL implementation
  async searchBloodTests(query) {
    // This will be implemented when we switch to MySQL
    throw new Error('Not implemented');
  }

  async updateBloodTestPrice(testId, newPrice) {
    // This will be implemented when we switch to MySQL
    throw new Error('Not implemented');
  }
}

// Export a singleton instance
export const bloodTestService = new BloodTestService(); 