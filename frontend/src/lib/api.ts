import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export const api = axios.create({ baseURL });

export function setToken(token?: string) {
  if (token) {
    (api.defaults.headers.common as any)["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete (api.defaults.headers.common as any)["Authorization"];
    localStorage.removeItem("token");
  }
}

export function getToken() {
  return localStorage.getItem("token") || undefined;
}
