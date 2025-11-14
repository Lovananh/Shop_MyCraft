// Mailer helper with explicit init and stable send function
const sendQueue = [];
let _impl = async (payload) => {
  // default behavior: queue until init() is called
  sendQueue.push(payload);
  console.warn('Mailer not ready yet — email queued (will send when ready).');
  console.info('Email payload queued:', payload);
  return Promise.resolve({ accepted: [payload.to], message: 'queued' });
};

async function sendEmail(payload) {
  return _impl(payload);
}

// initMailer tries to connect to SMTP and sets _impl to the real sender
async function initMailer() {
  try {
    const nodemailer = require('nodemailer');
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      FROM_EMAIL,
      SMTP_ALLOW_INSECURE,
    } = process.env;

    const host = SMTP_HOST || 'smtp.ethereal.email';
    const preferredPort = SMTP_PORT ? Number(SMTP_PORT) : undefined;
    const ports = [];
    if (preferredPort) ports.push(preferredPort);
    [587, 465].forEach((p) => { if (!ports.includes(p)) ports.push(p); });

    let lastError = null;
    let activeTransporter = null;

    for (const port of ports) {
      const secure = port === 465;
      const options = {
        host,
        port,
        secure,
        auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      };
      if (SMTP_ALLOW_INSECURE === 'true') options.tls = { rejectUnauthorized: false };

      try {
        const transporter = nodemailer.createTransport(options);
        await transporter.verify();
        console.log(`Mailer connected using ${host}:${port} (secure=${secure})`);
        activeTransporter = transporter;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Mailer verify failed for ${host}:${port} —`, err && err.code ? err.code : err.message);
      }
    }

    if (activeTransporter) {
      _impl = async ({ to, subject, text, html }) => {
        const from = FROM_EMAIL || SMTP_USER || 'no-reply@example.com';
        const mailOptions = { from, to, subject, text, html };
        return activeTransporter.sendMail(mailOptions);
      };

      // flush queued emails
      while (sendQueue.length) {
        const payload = sendQueue.shift();
        try {
          await _impl(payload);
          console.log('Flushed queued email to', payload.to);
        } catch (e) {
          console.error('Failed to send queued email to', payload.to, e);
        }
      }
    } else {
      console.error('Mailer could not connect to any SMTP port. Last error:', lastError);
      _impl = async ({ to, subject, text, html }) => {
        console.warn('nodemailer available but could not connect — logging email instead.');
        console.info('Email payload:', { to, subject, text, html });
        return Promise.resolve({ accepted: [to], message: 'logged-only' });
      };
    }
  } catch (e) {
    // nodemailer not installed — keep a logger that records payloads
    _impl = async ({ to, subject, text, html }) => {
      console.warn('nodemailer unavailable — skipping email send.');
      console.info('Email payload:', { to, subject, text, html });
      return Promise.resolve({ accepted: [to], message: 'logged-only' });
    };
  }
}

module.exports = sendEmail;
module.exports.init = initMailer;
