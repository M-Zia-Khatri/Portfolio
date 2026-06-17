// client/src/shared/api/axios.ts
import axios from "axios";
import { setupInterceptors } from "./interceptors";

const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_URL");
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Call the function to attach interceptors to the 'api' instance
setupInterceptors(api);
