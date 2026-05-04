// client/src/shared/api/axios.ts
import axios from 'axios';
import { setupInterceptors } from './interceptors';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Call the function to attach interceptors to the 'api' instance
setupInterceptors(api);
