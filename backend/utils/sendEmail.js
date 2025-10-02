const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    const msg = {
        to: options.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: options.subject,
        text: options.message,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid');
    } catch (error) {
        console.error('Error sending email via SendGrid', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;