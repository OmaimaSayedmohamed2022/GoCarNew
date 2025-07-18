import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    // service: "gmail",
    host: process.env.E_HOST || "smtp.gmail.com",
    port: parseInt(process.env.E_PORT, 10) || 587,
    secure: false, 
    auth: {
        user: process.env.E_USER, 
        pass: process.env.E_PASSWORD, 
    },
    debug: true,
    logger: true,
});



export const sendMail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: `"Wellbeing Day" <${process.env.E_USER}>`,
            to: to, 
            subject: subject, 
            text: text, 
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw new Error("Failed to send email");
    }
};

