import nodemailer from "nodemailer";

export async function sendMail(
  emailAddress: string,
  emailContent: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.APP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: emailAddress,
      subject: "Rendelés visszaigazolása",
      text: emailContent,
    });
    console.log(`Email sent ${info.response}`);
  } catch (err) {
    console.error(`Email error: ${err}`);
  }
}
