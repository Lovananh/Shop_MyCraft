// server/routes/profileRouter.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');
const { upload, validateImage } = require('../middleware/uploadAvatar');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const AVATAR_DIR = path.join(__dirname, '../uploads/avatars');
fs.mkdir(AVATAR_DIR, { recursive: true }).catch(() => { });

router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        res.json({
            _id: user._id,
            username: user.username,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || 'https://place.dog/300/300',
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.put('/', verifyToken, async (req, res) => {
    const { name, email, phone, address } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    try {
        const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
        res.json({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || 'https://place.dog/300/300'
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi cập nhật' });
    }
});

router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Chưa chọn ảnh' });

    if (!validateImage(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({ message: 'File không hợp lệ (magic bytes sai)' });
    }

    const ext = req.file.mimetype === 'image/jpeg' ? 'jpg' : req.file.mimetype.split('/')[1];
    const filename = `${req.user.userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const filepath = path.join(AVATAR_DIR, filename);

    try {
        await fs.writeFile(filepath, req.file.buffer);
        const avatarUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/avatars/${filename}`;
        await User.findByIdAndUpdate(req.user.userId, { avatar: avatarUrl });
        res.json({ avatar: avatarUrl });
    } catch (err) {
        console.error('Upload avatar error:', err);
        res.status(500).json({ message: 'Lỗi lưu ảnh' });
    }
});

router.put('/password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Thiếu thông tin' });

    try {
        const user = await User.findById(req.user.userId);
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;