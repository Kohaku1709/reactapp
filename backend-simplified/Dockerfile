FROM node:20-alpine

WORKDIR /app

# Copy lockfiles va cai dat tat ca thu vien backend
COPY package*.json ./
RUN npm install

# Copy toan bo ma nguon backend
COPY . .

EXPOSE 3001

# Netcat (nc) mac dinh co san trong Alpine Linux.
# Lenh nay cho doi cho den khi cong 5432 cua container 'db' mo, sau do moi tu dong chay
# migrate (tao bang), seed (nhap du lieu) va start (khoi dong server backend).
CMD sh -c "until nc -z -v -w30 db 5432; do echo 'Dang cho co so du lieu khoi dong...'; sleep 2; done && npm run db:migrate && npm run db:seed && npm start"
