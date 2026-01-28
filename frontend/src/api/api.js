import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const Api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

const ApiWithFormData = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
})

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((c) => c.trim()).filter(Boolean);
  for (const c of cookies) {
    const eq = c.indexOf("=");
    if (eq === -1) continue;
    const k = c.slice(0, eq).trim();
    if (k === name) return decodeURIComponent(c.slice(eq + 1));
  }
  return null;
};

const attachSecurityHeaders = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Backend supports headers.token and Authorization: Bearer
    config.headers = config.headers || {};
    config.headers.token = token;
    config.headers.Authorization = `Bearer ${token}`;
  }

  // CSRF header (only required when using cookie-based auth)
  const method = (config.method || "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCookie("csrf_token");
    if (csrf) {
      config.headers = config.headers || {};
      config.headers["x-csrf-token"] = csrf;
    }
  }

  return config;
};

Api.interceptors.request.use(attachSecurityHeaders);
ApiWithFormData.interceptors.request.use(attachSecurityHeaders);

// login api 
export const loginApi = (data) => Api.post('/api/user/login', data);
export const registerApi = (data) => Api.post('/api/user/register', data);
export const getProfileApi = (id) => Api.get(`/api/user/profile/${id}`);
export const updateProfileApi = (id, data) => Api.put(`/api/user/profile/${id}`, data);

//product
export const getAllProductApi = () => Api.get('/api/product/list');
export const getProductByIDApi = (id) => Api.get(`/api/product/single/${id}`);

//cart
export const addToCartApi = (data) => Api.post('/api/cart/add', data);
export const getAllCartItems = (id) => Api.get(`/api/cart/list/${id}`);
// Correct removeFromCart API to send data in axios.delete config
export const removeFromCart = (data) =>
    Api.delete('/api/cart/remove', { data });

//password reset
export const forgotPasswordApi = (data) => Api.post('/api/user/forgot-password', data);
export const resetPasswordApi = (data) => Api.post('/api/user/reset-password', data);

//newsletter
export const subscribeNewsletterApi = (data) => Api.post('/api/newsletter/subscribe', data);
export const unsubscribeNewsletterApi = (data) => Api.post('/api/newsletter/unsubscribe', data);

//contact
export const submitContactApi = (data) => Api.post('/api/contact/submit', data);

export default Api;
