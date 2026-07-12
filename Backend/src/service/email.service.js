import nodemailer from "nodemailer"

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    }
})

// Verify the connection configuration

transport.verify((error, success) => {
    if(error) {
        console.error('Error connecting to email server : ', error)
    } else {
        console.log('Email server is ready to send messages')
    }
});


// Funtion to send email 
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transport.sendMail({
            from: `"Interview Master" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log(`Message sent ${info.messageId}`);
        console.log(`Preview URL : ${nodemailer.getTestMessageUrl(info)}`)
        return info
    } catch (error) {
        console.error('Error sending email: ', error)
        throw error
    }
}


const sendEmailService = async (userEmail, userName) => {
    const subject = 'Welcome to Interview Master';
    const text = `Hi ${userName},\n\nWelcome to Interview Master! We're glad to have you on board.\n\nBest,\nThe Interview Master Team`;
    const html = `<p>Hi ${userName},</p><p>Welcome to Interview Master! We're glad to have you on board.</p><p>Best,<br>The Interview Master Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

export { sendEmailService }
