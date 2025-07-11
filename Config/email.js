import nodemailer from 'nodemailer';

const sendConfirmationEmail = async (applicantData) => {
  const toEmail = applicantData.email;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: '"Bite Bliss" <team@bitebliss.com>',
    to: toEmail,
    subject: `Application Received for ${applicantData.position}`,
    text: `Hi ${applicantData.name},

Thank you for applying to Bite Bliss as a ${applicantData.position}. We'll review your application soon.

Best regards,  
Bite Bliss Team`,
  };

  try {
    console.log('Sending email to:', toEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent. Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

export default sendConfirmationEmail;