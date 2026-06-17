import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// File khởi chạy ứng dụng React (Entry point)
// 1. Tìm phần tử HTML có id="root" trong tệp index.html
// 2. Sử dụng createRoot để quản lý và render cây Component của React vào root đó
// 3. StrictMode được bọc bên ngoài để cảnh báo các lỗi tiềm ẩn trong quá trình phát triển
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
