import nodemailer from 'nodemailer';

const emailPass = process.env.EMAIL_PASS || "checkENVlol";
const platformEmail = process.env.PLATFORM_EMAIL || "alexindevs@gmail.com"

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        debug: true,
        logger: true,
        auth: {
            user: platformEmail,
            pass: emailPass,
        },
        tls: {
            rejectUnauthorized: false
        }
      });
    
      const mailOptions = {
            from: platformEmail,
            to,
            subject,
            text: "",
            html: html || "",
      };
      console.log(mailOptions.from, mailOptions.html, mailOptions.subject, mailOptions.to)

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending email');
    }
  }
  