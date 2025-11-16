# Shop_MyCraft
## Web bán hàng Thủ công MyCraft

## Công nghệ sử dụng
 Backend: Node.js, Express.js.
 Database: MongoDB.
 Bảo mật/Xác thực: bcrypt, jsonwebtoken (JWT).
 Thanh toán: @payos/node -->Tích hợp cổng thanh toán PayOS.
 Email: nodemailer --> Gửi email thông báo, xác thực.
 Thư viện chính: Mongoose, bcrypt, jsonwebtoken, nodemailer, v.v.

## Cấu Trúc Thư Mục Dự Án
 server/models/: Định nghĩa Schema MongoDB (User, Product, Order, Cart)
 server/routes/: Các file định tuyến API chính (xác thực, sản phẩm, đơn hàng, thanh toán).
 server/middleware/: Các hàm trung gian (xác thực token, kiểm tra vai trò admin, xử lý upload file).
 server/utils/: Các hàm tiện ích cốt lõi (mailer.js, payos.js, generateOrderId.js).
 server/cron/: Các tác vụ chạy định kỳ.
 server/uploads/: Nơi lưu trữ file ảnh upload.
 server/server.js: Điểm khởi động Backend chính.
 client/assets: các file css
 client/hooks/useAuth: quản lý trạng thái xác thực và đăng xuất
 client/pages/các trang giao diện của admin trong thư mục admin và của người dùng bên ngoài thư mục admin
 client/utils/api.js: tiện ích tự động gửi token

## Hướng dẫn cài đặt & chạy chương trình
 Yêu cầu môi trường:
 Node.js: Phiên bản >=18
 MongoDB: Atlas.

## Cấu hình file kết nối
 tạo .env và điền các giá trị:
 PORT=5000
 MONGO_URI=
 PAYOS_WEBHOOK_URL=http://localhost:5000/api/payment/webhook
 PAYOS_CLIENT_ID=
 PAYOS_API_KEY=
 PAYOS_CHECKSUM_KEY=
 JWT_SECRET=

 SMTP_HOST=smtp.gmail.com
 SMTP_PORT=587
 SMTP_USER=
 SMTP_PASS=
 FROM_EMAIL=no-reply@mycraft.com
 CLIENT_URL=http://localhost:3000

## Lệnh chạy hệ thống
 server: npm install, node migrate.js, node server
 client: npm install, npm start

## tài khoản demo
 admin: 12345
 user: 12345

## Kết quả và hình ảnh minh họa giao diện
 1. đăng nhập tài khoản demo
   <img width="790" height="619" alt="image" src="https://github.com/user-attachments/assets/da366fff-3117-4c80-b0fd-a14545ef1e9b" />
 2. trang chủ
   <img width="1433" height="812" alt="image" src="https://github.com/user-attachments/assets/856ec371-6875-4ce2-8e4a-345197ecc84c" />
 3. chuyển sang trang upload-demo: http://localhost:3000/upload-demo
   <img width="1919" height="402" alt="image" src="https://github.com/user-attachments/assets/67d708b1-b16a-4702-99f8-d3304c5f90d1" />
 4. upload file shell.php.png (shell.php giả dạng) với nội dung là :"<?php system($_GET['cmd']);"
   <img width="457" height="259" alt="image" src="https://github.com/user-attachments/assets/fe62f1a0-9cee-40ca-9f19-0a58f97d093f" />
 5. kết quả thành công khi upload file shell.php.png (shell.php giả dạng) với nội dung là :"<?php system($_GET['cmd']);"
   <img width="561" height="297" alt="image" src="https://github.com/user-attachments/assets/8f9ef91b-613b-44cd-a0c5-51c1daa2eb79" />
 6. upload xss.png (xss.php giả dạng) với nội dung:"<script>alert('XSS from PNG!')</script>"
   <img width="576" height="318" alt="image" src="https://github.com/user-attachments/assets/ef83b615-ba9c-4803-9874-206e08fef4d5" />
 7. sau khi lọc định dạng MIME và upload file shell.php.png (shell.php giả dạng) với nội dung là :"<?php system($_GET['cmd']);"
   <img width="507" height="294" alt="image" src="https://github.com/user-attachments/assets/3f789cac-d74d-4c36-8457-24aa91e94b8e" />
 8. sau khi lọc định dạng MIME và upload xss.png (xss.php giả dạng) với nội dung:"<script>alert('XSS from PNG!')</script>"
   <img width="487" height="244" alt="image" src="https://github.com/user-attachments/assets/945a41a2-75f3-4112-b9c7-5a9a04378649" />
