import axios from 'axios';

// Базовый URL бэкенда. Меняй через VITE_API_URL в .env если нужен другой порт.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = axios.create({
  baseURL: BASE,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});
