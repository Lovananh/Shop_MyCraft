const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, address, phone, role } = req.body;

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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt'
            });
        }

        // Phone: nếu có thì phải 10-15 số (Mongoose sẽ kiểm tra định dạng VN)
        if (phone && !/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({
                message: 'Số điện thoại không hợp lệ'
            });
        }

        if (await User.findOne({ username })) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

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

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            role: user.role
        });


    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;