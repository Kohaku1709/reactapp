FROM node:20-alpine

WORKDIR /app

# Copy lockfiles va cai dat tat ca thu vien backend
COPY package*.json ./
RUN npm install

# Copy toan bo ma nguon backend
COPY . .

# Set quyen thuc thi cho file start.sh
RUN chmod +x start.sh

EXPOSE 3001

# Chay file start.sh de khoi dong container
CMD ["./start.sh"]
