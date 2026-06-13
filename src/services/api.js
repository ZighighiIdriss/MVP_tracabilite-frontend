import axios from 'axios';

// ================================
// CONFIGURATION AXIOS
// ================================

const API_BASE_URL =
    import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// ================================
// INTERCEPTEUR GLOBAL DES ERREURS
// ================================

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message =
            error.response?.data?.message || error.message || 'Erreur inconnue';

        // Log technique
        console.error('API ERROR:', {
            status,
            message,
            url: error.config?.url,
        });

        // Messages utilisateur simplifiés
        switch (status) {
            case 400:
                alert('Requête invalide');
                break;
            case 401:
                alert('Non autorisé');
                break;
            case 403:
                alert('Accès refusé');
                break;
            case 404:
                alert('Ressource introuvable');
                break;
            case 500:
                alert('Erreur serveur');
                break;
            default:
                alert('Erreur réseau');
        }

        return Promise.reject(error);
    }
);

// ================================
// MÉTHODES GÉNÉRIQUES (DRY)
// ================================

const get = (url) => apiClient.get(url).then((res) => res.data);
const post = (url, data) => apiClient.post(url, data).then((res) => res.data);
const put = (url, data) => apiClient.put(url, data).then((res) => res.data);
const del = (url) => apiClient.delete(url).then((res) => res.data);

// ================================
// AUTH API
// ================================

export const login = (email, password) =>
    post('/auth/login', { email, password });

export const demoLogin = () => post('/auth/demo');

// ================================
// DASHBOARD API
// ================================

export const getDashboardStats = () => get('/dashboard');

export const getRecentProducts = () =>
    get('/dashboard/recent-products');

// ================================
// PRODUCTS API
// ================================

export const createProduct = (productData) =>
    post('/products', productData);

export const getAllProducts = () => get('/products');

export const getProductById = (id) =>
    get(`/products/${id}`);

export const updateProduct = (id, data) =>
    put(`/products/${id}`, data);

export const deleteProduct = (id) =>
    del(`/products/${id}`);

// ================================
// TRACEABILITY STEPS API
// ================================

export const addStep = (productId, stepData) =>
    post(`/products/${productId}/steps`, stepData);

export const getProductSteps = (productId) =>
    get(`/products/${productId}/steps`);

export const deleteStep = (stepId) =>
    del(`/products/steps/${stepId}`);

// ================================
// REFERENCE DATA API
// ================================

export const getProductTypes = () => get('/product-types');

export const getMaterials = () => get('/materials');

export const getSuppliers = () => get('/suppliers');

export const getStepTypes = () => get('/step-types');