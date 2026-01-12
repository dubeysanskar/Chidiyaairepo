// API Service Layer - Backend Ready
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    login: (email, password) =>
        fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    register: (userData) =>
        fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getCurrentUser: () =>
        fetchAPI('/auth/me'),
};

// Supplier API
export const supplierAPI = {
    register: (supplierData) =>
        fetchAPI('/supplier/register', { method: 'POST', body: JSON.stringify(supplierData) }),

    login: (email, password) =>
        fetchAPI('/supplier/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    submitKYC: (documents) =>
        fetchAPI('/supplier/kyc', { method: 'POST', body: JSON.stringify(documents) }),

    getProfile: () =>
        fetchAPI('/supplier/profile'),

    updateProfile: (data) =>
        fetchAPI('/supplier/profile', { method: 'PUT', body: JSON.stringify(data) }),

    getInquiries: () =>
        fetchAPI('/supplier/inquiries'),

    submitQuote: (inquiryId, quoteData) =>
        fetchAPI(`/supplier/inquiries/${inquiryId}/quote`, { method: 'POST', body: JSON.stringify(quoteData) }),

    getDashboardStats: () =>
        fetchAPI('/supplier/dashboard'),
};

// Buyer API
export const buyerAPI = {
    getProfile: () =>
        fetchAPI('/buyer/profile'),

    updateProfile: (data) =>
        fetchAPI('/buyer/profile', { method: 'PUT', body: JSON.stringify(data) }),

    sendInquiry: (inquiryData) =>
        fetchAPI('/buyer/inquiries', { method: 'POST', body: JSON.stringify(inquiryData) }),

    getInquiries: () =>
        fetchAPI('/buyer/inquiries'),

    getQuotes: (inquiryId) =>
        fetchAPI(`/buyer/inquiries/${inquiryId}/quotes`),

    acceptQuote: (quoteId) =>
        fetchAPI(`/buyer/quotes/${quoteId}/accept`, { method: 'POST' }),

    rejectQuote: (quoteId) =>
        fetchAPI(`/buyer/quotes/${quoteId}/reject`, { method: 'POST' }),

    downloadQuotePDF: (quoteId) =>
        `${API_BASE_URL}/buyer/quotes/${quoteId}/pdf`,

    getDashboardStats: () =>
        fetchAPI('/buyer/dashboard'),
};

// Search API
export const searchAPI = {
    searchSuppliers: (query) =>
        fetchAPI('/search/suppliers', { method: 'POST', body: JSON.stringify(query) }),

    getTopSuppliers: (category, limit = 5) =>
        fetchAPI(`/search/top-suppliers?category=${category}&limit=${limit}`),
};

export default { authAPI, supplierAPI, buyerAPI, searchAPI };
