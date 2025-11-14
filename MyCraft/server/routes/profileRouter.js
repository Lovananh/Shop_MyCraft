// server/routes/profileRouter.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const upload = require('../middleware/upload');

//lẤY PROFILE
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        res.json({
            _id: user._id,
            username: user.username,
            name: user.name || '',
            email: user.email || '',
            address: user.address || '',
            phone: user.phone || '',
            avatar: user.avatar || 'https://place.dog/100/100',
            role: user.role,
        });
    } catch (err) {
        console.error('Lỗi lấy profile:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//CẬP NHẬT PROFILe
router.put('/', verifyToken, async (req, res) => {
    const { name, address, phone, email } = req.body;

    if (name !== undefined && !/^[a-zA-ZÀ-ỹ\s]{2,100}$/.test(name)) {
        return res.status(400).json({ message: 'Tên không hợp lệ' });
    }
    if (phone && !/^(?:\+84|0)(?:3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(phone)) {
        return res.status(400).json({ message: 'SĐT không hợp lệ' });
    }

    try {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (address !== undefined) updates.address = address;
        if (phone !== undefined) updates.phone = phone;
        if (email !== undefined) updates.email = email;

        // Nếu đổi email, kiểm tra định dạng và unique
        if (email !== undefined) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
            const existing = await User.findOne({ email });
            if (existing && existing._id.toString() !== req.user.userId) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        res.json({
            _id: user._id,
            username: user.username,
            name: user.name || '',
            email: user.email || '',
            address: user.address || '',
            phone: user.phone || '',
            avatar: user.avatar || 'https://place.dog/100/100',
            role: user.role,
        });
    } catch (err) {
        console.error('Lỗi cập nhật profile:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// === UPLOAD AVATAR ===
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Chưa chọn ảnh' });

        const avatarUrl = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { avatar: avatarUrl },
            { new: true }
        ).select('avatar');

        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        res.json({ avatar: user.avatar });
    } catch (err) {
        console.error('Lỗi upload avatar:', err);
        res.status(500).json({ message: 'Lỗi upload ảnh' });
    }
});

module.exports = router;