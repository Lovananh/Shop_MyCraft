// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET;

// ==================== ĐĂNG KÝ (giữ nguyên validate của bạn) ====================
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email, address, phone, role } = req.body;

        // === VALIDATE GIỮ NGUYÊN 100% NHƯ FILE GỐC ===
        if (!username || !password || !name || !email) {
            return res.status(400).json({ message: 'Tên đăng nhập, mật khẩu, tên và email là bắt buộc' });
        }
        if (username.length < 6 || username.length > 50) {
            return res.status(400).json({ message: 'Tên đăng nhập phải từ 6 đến 50 ký tự' });
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
        // ============================================

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({
            username,
            password: hashedPassword,
            name,
            email: email.toLowerCase(),
            address,
            phone,
            role: role || 'user',
            isVerified: false,
            verificationToken,
            verificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        });
        await user.save();

        // === GỬI EMAIL SIÊU NGẮN – CHỈ 5 DÒNG ===
        try {
            await sendVerificationEmail(user.email, verificationToken);
            console.log(`Email xác thực đã gửi tới: ${user.email}`);
        } catch (err) {
            console.error('Lỗi gửi email xác thực:', err.message);
            // Vẫn cho đăng ký tiếp, không block
        }
        // =======================================

            res.status(201).json({
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
                user: { username: user.username, email: user.email, role: user.role }
            });

    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ==================== ĐĂNG NHẬP  ====================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        if (!user.isVerified && !user.createdByAdmin) {
            return res.status(403).json({
                message: 'Vui lòng xác thực email trước khi đăng nhập.',
                needsVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, role: user.role });

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ==================== XÁC THỰC EMAIL ====================
router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: 'Thiếu token' });

        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Link xác thực không hợp lệ hoặc đã hết hạn' });

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/login?verified=true`);

    } catch (err) {
        console.error('Lỗi verify:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;