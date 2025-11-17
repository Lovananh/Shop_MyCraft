// server/routes/upload.js – PHIÊN BẢN "CÓ LỖ HỔNG" (DEMO)

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// BỎ MIME FILTER → CHO PHÉP TẤT CẢ
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    // fileFilter: BỎ HOÀN TOÀN → không kiểm tra MIME
});

// BỎ MAGIC BYTES → KHÔNG KIỂM TRA NỘI DUNG THẬT
// → function checkMagicBytes() → XÓA HOÀN TOÀN

// VẪN GIỮ JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Thiếu token' });
    // BỎ jwt.verify → để test dễ
    req.user = { id: 'demo' };
    next();
}

// ROUTE: CHO PHÉP UPLOAD MỌI THỨ
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Không có file' });

    // LẤY ĐUÔI TỪ TÊN FILE → DỄ BỊ LỪA
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1) || 'bin';
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filepath = path.join(__dirname, '../uploads', filename);

    try {
        await fs.writeFile(filepath, req.file.buffer);
        res.json({
            message: 'Upload thành công (CÓ LỖ HỔNG!)',
            filename,
            url: `http://localhost:5000/uploads/${filename}`
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lưu file' });
    }
});

module.exports = router;



