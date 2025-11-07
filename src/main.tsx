import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { useAuthStore } from "./store/authStore";
import App from './App.tsx'

// Restore user jika ada token di localStorage
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

if (token && userData) {
  const user = JSON.parse(userData);
  useAuthStore.setState({ token, user, isAuthenticated: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
