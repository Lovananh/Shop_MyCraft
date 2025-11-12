// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, address, phone, role } = req.body;

        // === 1. VALIDATE THỦ CÔNG (đơn giản, nhanh, rõ ràng) ===
        if (!username || !password || !name) {
            return res.status(400).json({
                message: 'Tên đăng nhập, mật khẩu và tên là bắt buộc'
            });
        }

        // Độ dài username
        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({
                message: 'Tên đăng nhập phải từ 3 đến 50 ký tự'
            });
        }

        // Độ dài mật khẩu tối thiểu (Mongoose sẽ kiểm tra regex + 8 ký tự)
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            });
        }

        // Phone: nếu có thì phải 10-15 số (Mongoose sẽ kiểm tra định dạng VN)
        if (phone && !/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({
                message: 'Số điện thoại không hợp lệ'
            });
        }

        // Role: chỉ cho phép 'user' hoặc 'admin'
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                message: 'Vai trò phải là "user" hoặc "admin"'
            });
        }

        // === 2. Hash mật khẩu ===
        const hashedPassword = await bcrypt.hash(password, 10);

        // === 3. Tạo user – Mongoose validate các điều kiện phức tạp ===
        const user = new User({
            username,
            password: hashedPassword,
            name,
            address: address || undefined,
            phone: phone || undefined,
            role: role || 'user',
        });

        // === 4. Lưu → Mongoose validate regex, required, unique, v.v. ===
        await user.save();

        // === 5. Thành công ===
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
        });

    } catch (err) {
        // === XỬ LÝ LỖI ===

        // 1. Lỗi validate từ Mongoose (regex, minlength 8, required, v.v.)
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors)
                .map(e => e.message)
                .join(', ');
            return res.status(400).json({ message: errors });
        }

        // 2. Lỗi trùng username
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        // 3. Lỗi server
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// === LOGIN (giữ nguyên) ===
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Tên đăng nhập và mật khẩu là bắt buộc'
            });
        }

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role || 'user',
        });
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;