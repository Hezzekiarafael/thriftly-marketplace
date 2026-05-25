import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});


// 🔐 Ambil token dari localStorage
const getToken = () => {
    return localStorage.getItem('token');
};


// 🛡️ Interceptor request (otomatis kirim token)
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


// ⚠️ Interceptor response (handle error global)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const msg = error.response.data?.message || '';

            if (status === 401) {
                // JANGAN hapus token di sini!
                // Token dihapus hanya oleh AuthContext saat logout atau getCurrentUser gagal.
                // Menghapus token di sini menyebabkan sesi hilang akibat error 401
                // dari endpoint yang tidak relevan (misal: /api/messages, /api/admin/products)
                console.warn(`[API 401] ${error.config?.url} - ${msg} (token dipertahankan)`);
            }

            // log error umum
            if (status !== 401) {
                console.error(`[API ${status}]`, error.response.data);
            }
        } else {
            console.error('Network error:', error.message);
        }

        return Promise.reject(error);
    }
);



// 📦 Helper function (opsional biar gampang)

// GET
export const get = (url, config = {}) => api.get(url, config);

// POST
export const post = (url, data, config = {}) => api.post(url, data, config);

// PUT
export const put = (url, data, config = {}) => api.put(url, data, config);

// DELETE
export const destroy = (url, config = {}) => api.delete(url, config);


// Export utama
export default api;