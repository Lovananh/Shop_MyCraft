# Shop_MyCraft
## Web bán hàng Thủ công MyCraft

## Công nghệ sử dụng
1. Backend: Node.js, Express.js.
2. Database: MongoDB.
3. Bảo mật/Xác thực: bcrypt, jsonwebtoken (JWT).
4. Thanh toán: @payos/node -->Tích hợp cổng thanh toán PayOS.
5. Email: nodemailer --> Gửi email thông báo, xác thực.
6. Thư viện chính: Mongoose, bcrypt, jsonwebtoken, nodemailer, v.v.

## Cấu Trúc Thư Mục Dự Án
1. server/models/: Định nghĩa Schema MongoDB (User, Product, Order, Cart)
2. server/routes/: Các file định tuyến API chính (xác thực, sản phẩm, đơn hàng, thanh toán).
3. server/middleware/: Các hàm trung gian (xác thực token, kiểm tra vai trò admin, xử lý upload file).
4. server/utils/: Các hàm tiện ích cốt lõi (mailer.js, payos.js, generateOrderId.js).
5. server/cron/: Các tác vụ chạy định kỳ.
6. server/uploads/: Nơi lưu trữ file ảnh upload.
7. server/server.js: Điểm khởi động Backend chính.
8. client/assets: các file css
9. client/hooks/useAuth: quản lý trạng thái xác thực và đăng xuất
10. client/pages/các trang giao diện của admin trong thư mục admin và của người dùng bên ngoài thư mục admin
11. client/utils/api.js: tiện ích tự động gửi token

## Hướng dẫn cài đặt & chạy chương trình
1. Yêu cầu môi trường:
2. Node.js: Phiên bản >=18
3. MongoDB: Atlas.

## Cấu hình file kết nối
1. tạo .env và điền các giá trị:
2. PORT=5000
3. MONGO_URI=
4. PAYOS_WEBHOOK_URL=http://localhost:5000/api/payment/webhook
5. PAYOS_CLIENT_ID=
6. PAYOS_API_KEY=
7. PAYOS_CHECKSUM_KEY=
8. JWT_SECRET=

9. SMTP_HOST=smtp.gmail.com
10. SMTP_PORT=587
11. SMTP_USER=
12. SMTP_PASS=
13. FROM_EMAIL=no-reply@mycraft.com
14. CLIENT_URL=http://localhost:3000

## Lệnh chạy hệ thống
1. server: npm install, node migrate.js, node server
2. client: npm install, npm start

## tài khoản demo
1. admin: 12345
2. user: 12345

## Kết quả và hình ảnh minh họa giao diện
1.  đăng nhập tài khoản demo
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/da366fff-3117-4c80-b0fd-a14545ef1e9b" />
   
2. trang chủ
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/856ec371-6875-4ce2-8e4a-345197ecc84c" />
   
3. chuyển sang trang upload-demo: http://localhost:3000/upload-demo
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/67d708b1-b16a-4702-99f8-d3304c5f90d1" />
   
4. upload file shell.php.png (shell.php giả dạng) với nội dung là :"<?php system($_GET['cmd']);"
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/fe62f1a0-9cee-40ca-9f19-0a58f97d093f" />
   
5. kết quả thành công khi upload file shell.php.png (shell.php giả dạng) với nội dung là :"<?php system($_GET['cmd']);"
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/8f9ef91b-613b-44cd-a0c5-51c1daa2eb79" />
   
6. upload xss.png (xss.php giả dạng) với nội dung:"<script>alert('XSS from PNG!')</script>"
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/ef83b615-ba9c-4803-9874-206e08fef4d5" />
   
7. sau khi lọc định dạng MIME và upload file shell.php.png (shell.php giả dạng) với nội dung là :"<?php system($_GET['cmd']);"
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/3f789cac-d74d-4c36-8457-24aa91e94b8e" />
   
8. sau khi lọc định dạng MIME và upload xss.png (xss.php giả dạng) với nội dung:"<script>alert('XSS from PNG!')</script>"
   <img width="800" height="400" alt="image" src="https://github.com/user-attachments/assets/945a41a2-75f3-4112-b9c7-5a9a04378649" />
   
