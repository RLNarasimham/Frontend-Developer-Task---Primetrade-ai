// const sgMail = require('@sendgrid/mail');

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async (options) => {
//     const msg = {
//         to: options.email,
//         from: process.env.SENDGRID_FROM_EMAIL,
//         subject: options.subject,
//         text: options.message,
//     };

//     try {
//         await sgMail.send(msg);
//         console.log('Email sent successfully via SendGrid');
//     } catch (error) {
//         console.error('Error sending email via SendGrid', error);
//         if (error.response) {
//             console.error(error.response.body);
//         }
//         throw new Error('Email could not be sent');
//     }
// };

// module.exports = sendEmail;


const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

const SENDGRID_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM = process.env.SENDGRID_FROM_EMAIL || '';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 0;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

const isEmail = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const buildHtml = (subject, message) => {
    const safeMessage = String(message || '').replace(/<\/?script[^>]*>/gi, '');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${subject}</title><style>body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f6f6f6}table{border-collapse:collapse;width:100%} .container{max-width:680px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden} .content{padding:24px} h1{font-size:20px;margin:0 0 12px} p{font-size:16px;line-height:1.5;margin:0 0 12px} @media(max-width:420px){.content{padding:16px}h1{font-size:18px}p{font-size:15px}}</style></head><body><table><tr><td><div class="container"><div class="content"><h1>${subject}</h1><div><p>${safeMessage.replace(/\n/g, '<br/>')}</p></div></div></div></td></tr></table></body></html>`;
};

const sendWithSendGrid = async (msg) => {
    const res = await sgMail.send(msg);
    return res;
};

const sendWithSMTP = async (mailOptions) => {
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT || (SMTP_SECURE ? 465 : 587),
        secure: SMTP_SECURE,
        auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        tls: { rejectUnauthorized: false },
    });
    const info = await transporter.sendMail(mailOptions);
    return info;
};

const sendEmail = async (options = {}) => {
    const to = options.email || options.to;
    const subject = options.subject || 'No subject';
    const text = options.message || options.text || '';
    const html = options.html || buildHtml(subject, text);

    if (!isEmail(to)) throw new Error('Invalid recipient email');
    if (!SENDGRID_FROM && !process.env.SMTP_FROM && !process.env.FROM_EMAIL) throw new Error('No sender email configured');

    const from = SENDGRID_FROM || process.env.SMTP_FROM || process.env.FROM_EMAIL;

    const maxAttempts = 3;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
        try {
            if (SENDGRID_KEY && SENDGRID_FROM) {
                const msg = { to, from, subject, text, html, mail_settings: { sandbox_mode: { enable: false } } };
                await sendWithSendGrid(msg);
                return { provider: 'sendgrid', success: true };
            }
            if (SMTP_HOST) {
                const mailOptions = { from, to, subject, text, html };
                const info = await sendWithSMTP(mailOptions);
                return { provider: 'smtp', success: true, info };
            }
            throw new Error('No email provider configured');
        } catch (error) {
            lastError = error;
            attempt += 1;
            if (attempt >= maxAttempts) break;
            const backoff = 200 * Math.pow(2, attempt);
            await sleep(backoff);
        }
    }

    const err = new Error('Email could not be sent');
    err.cause = lastError;
    throw err;
};

module.exports = sendEmail;
