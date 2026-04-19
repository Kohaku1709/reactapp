import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Điểm vào của ứng dụng React: render App vào thẻ #root trong index.html.
// Bọc StrictMode để phát hiện sớm cảnh báo/best-practice trong quá trình học.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
