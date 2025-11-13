const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email, address, phone, role } = req.body;

        if (!username || !password || !name || !email) {
            return res.status(400).json({ message: 'Tên đăng nhập, mật khẩu, tên và email là bắt buộc' });
        }
        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ message: 'Tên đăng nhập phải từ 3 đến 50 ký tự' });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt'
            });
        }
        if (phone && !/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
        }
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Vai trò phải là "user" hoặc "admin"' });
        }

        if (await User.findOne({ username })) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            name,
            email,
            address,
            phone,
            role: role || 'user',
        });
        await user.save();

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        if (err.code === 11000) {
            const dupKey = Object.keys(err.keyValue || {})[0] || 'Trường';
            return res.status(400).json({ message: `${dupKey} đã tồn tại` });
        }
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
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
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