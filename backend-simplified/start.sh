#!/bin/sh

# Nếu DB_HOST là 'db', đợi cơ sở dữ liệu khởi động (chạy local qua docker-compose)
if [ "$DB_HOST" = "db" ]; then
  until nc -z -v -w30 db 5432; do
    echo "Dang cho co so du lieu khoi dong..."
    sleep 2
  done
fi

# Chạy migration tạo bảng
npm run db:migrate

# Chạy seed dữ liệu mẫu
npm run db:seed

# Khởi chạy server Express
npm start
