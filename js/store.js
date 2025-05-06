// Simple state management system
class Store {
    constructor() {
        this.state = {
            user: null,
            cart: [],
            filters: {
                price: null,
                trustpilot: null,
                location: null,
                resultsTime: null,
                providers: [],
                biomarkers: []
            },
            loading: false,
            error: null
        };
        
        this.listeners = new Set();
    }

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // Notify all listeners of state change
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Update state
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    // User actions
    setUser(user) {
        this.setState({ user });
    }

    clearUser() {
        this.setState({ user: null });
    }

    // Cart actions
    addToCart(item) {
        const cart = [...this.state.cart];
        const existingItem = cart.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        
        this.setState({ cart });
    }

    removeFromCart(itemId) {
        const cart = this.state.cart.filter(item => item.id !== itemId);
        this.setState({ cart });
    }

    updateCartItemQuantity(itemId, quantity) {
        const cart = this.state.cart.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity };
            }
            return item;
        });
        this.setState({ cart });
    }

    clearCart() {
        this.setState({ cart: [] });
    }

    // Filter actions
    setFilter(type, value) {
        const filters = { ...this.state.filters };
        filters[type] = value;
        this.setState({ filters });
    }

    setBiomarkerFilter(biomarkers) {
        const filters = { ...this.state.filters };
        filters.biomarkers = biomarkers;
        this.setState({ filters });
    }

    setProviderFilter(providers) {
        const filters = { ...this.state.filters };
        filters.providers = providers;
        this.setState({ filters });
    }

    clearFilters() {
        this.setState({
            filters: {
                price: null,
                trustpilot: null,
                location: null,
                resultsTime: null,
                providers: [],
                biomarkers: []
            }
        });
    }

    // Loading state
    setLoading(loading) {
        this.setState({ loading });
    }

    // Error handling
    setError(error) {
        this.setState({ error });
    }

    clearError() {
        this.setState({ error: null });
    }
}

// Create and export a singleton instance
const store = new Store();
export default store; 