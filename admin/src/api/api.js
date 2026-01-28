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
  // Admin panel already passes header token for some endpoints; keep it, but also support cookie auth + CSRF
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

// login Admin api 
export const loginAdminApi = (data) => Api.post('/api/user/admin', data);

// change admin password api
export const changeAdminPasswordApi = (data, token) => Api.post('/api/user/change-admin-password', data, {
  headers: { token }
});

// newsletter subscribers api
export const getAllSubscribersApi = (token) => Api.get('/api/newsletter/all', {
  headers: { token }
});

// delete subscriber api
export const deleteSubscriberApi = (id, token) => Api.delete(`/api/newsletter/delete/${id}`, {
  headers: { token }
});

export default Api;
