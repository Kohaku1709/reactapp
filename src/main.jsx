import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Called by: Vite runtime khi bundle đã load trên browser.
// Params: document.getElementById("root"). Accepted values: HTMLElement hợp lệ, không null.
// Output: React tree được mount vào DOM.
// Does: khởi tạo ứng dụng bằng React 18 API createRoot + StrictMode.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
