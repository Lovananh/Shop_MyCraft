// server/utils/mailer.js
const nodemailer = require('nodemailer');

let transporter = null;

async function initMailer() {
    if (transporter) return transporter;

    const {
        SMTP_HOST = 'smtp.gmail.com',
        SMTP_PORT = 587,
        SMTP_USER,
        SMTP_PASS,
        FROM_EMAIL = 'MyCraft Shop <no-reply@mycraft.shop>'
    } = process.env;

    if (!SMTP_USER || !SMTP_PASS) {
        console.warn('Cảnh báo: Thiếu SMTP_USER hoặc SMTP_PASS → email chỉ được log, không gửi thật');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_PORT == 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.verify();
        console.log('SMTP Gmail kết nối thành công!');
        console.log(`Gửi email từ: ${FROM_EMAIL}`);
    } catch (err) {
        console.error('Lỗi kết nối SMTP:', err.message);
        transporter = null;
    }

    return transporter;
}

async function sendEmail({ to, subject, html, text }) {
    const transporter = await initMailer();
    const from = process.env.FROM_EMAIL || 'MyCraft Shop <no-reply@mycraft.shop>';

    if (!transporter) {
        console.log('SMTP chưa sẵn sàng → chỉ log email:');
        console.log(`To: ${to} | Subject: ${subject}`);
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        });
        console.log(`Email gửi thành công tới ${to} | ID: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`Lỗi gửi email tới ${to}:`, err.message);
        return false;
    }
}

// Gửi email xác thực đăng ký
async function sendVerificationEmail(to, token) {
    const verifyUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/verify?token=${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; background:#fafafa; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h2 style="color: #d4a574; text-align:center; margin-bottom: 8px;">MyCraft Shop</h2>
            <p style="text-align:center; color:#888; font-size:14px; margin-bottom: 30px;">Cửa hàng thủ công tinh tế</p>
            
            <h3 style="color:#333;">Chào mừng bạn đến với MyCraft!</h3>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực email để hoàn tất:</p>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="${verifyUrl}" style="background:#d4a574; color:white; padding:16px 36px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px; box-shadow:0 4px 10px rgba(212,165,116,0.3);">
                    XÁC THỰC EMAIL NGAY
                </a>
            </div>
            
            <p style="background:#f0f0f0; padding:15px; border-radius:8px; font-size:13px; color:#666; word-break:break-all;">
                Hoặc copy link:<br>
                <a href="${verifyUrl}" style="color:#d4a574;">${verifyUrl}</a>
            </p>
            
            <p style="text-align:center; color:#999; font-size:12px; margin-top:30px;">
                Liên kết hết hạn sau <strong>24 giờ</strong>.<br>
                Nếu bạn không đăng ký, vui lòng bỏ qua email này.
            </p>
        </div>
    `;

    await sendEmail({
        to,
        subject: 'Xác thực email đăng ký - MyCraft Shop',
        html,
    });
}

// Gửi email quên mật khẩu
async function sendPasswordResetEmail(to, name, token, code) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; background:#fafafa;">
            <h2 style="color:#e74c3c; text-align:center;">Đặt lại mật khẩu</h2>
            <p>Xin chào <strong>${name || 'bạn'}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            
            <div style="background:#fff3cd; padding:20px; border-radius:10px; text-align:center; margin:20px 0; border-left:5px solid #f39c12;">
                <strong style="font-size:16px;">Mã xác nhận (6 số):</strong><br>
                <span style="font-size:32px; letter-spacing:5px; color:#e67e22; font-family:monospace;">${code}</span>
            </div>
            
            <p>Hoặc nhấn nút bên dưới để đặt lại ngay:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background:#e74c3c; color:white; padding:16px 36px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
                    ĐẶT LẠI MẬT KHẨU
                </a>
            </div>
            
            <p style="text-align:center; color:#999; font-size:12px;">
                Mã và liên kết hết hạn sau <strong>60 phút</strong>.<br>
                Nếu bạn không yêu cầu, hãy bỏ qua email này.
            </p>
        </div>
    `;

    await sendEmail({
        to,
        subject: 'Đặt lại mật khẩu - MyCraft Shop',
        html,
    });
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    initMailer,
};