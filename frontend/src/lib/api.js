import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach Bearer token if present in localStorage
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("ybex_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
