# GIAI DOAN 1: Build ma nguon React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfiles va cai dat tat ca thu vien
COPY package*.json ./
RUN npm install

# Copy ma nguon va build project
COPY . .
RUN npm run build

# GIAI DOAN 2: Khoi chay may chu Web Nginx phuc vu file tinh
FROM nginx:1.25-alpine

# Copy cau hinh Nginx ho tro React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy thu muc dist tinh tu Giai doan 1 vao Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
