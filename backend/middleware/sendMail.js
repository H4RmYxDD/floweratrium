import nodemailer from 'nodemailer';
async function sendMail(emailAddress, emailContent) {
    const trnsporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.APP_PASSWORD,
        },
    });

    try {
        const info = await trnsporter.sendMail({
            from: process.env.EMAIL_SENDER,
            to: emailAddress,
            subject: 'Rendelés visszaigazolása',
            text: emailContent,
        });
        console.log(`Email sent ${info.response}`);
    } catch (err) {
        console.log(`Email error: ${err}`);
    }
}
export { sendMail };
