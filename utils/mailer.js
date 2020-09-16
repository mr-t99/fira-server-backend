const nodemailer = require('nodemailer');

function sendAllMail(data, text) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'ngocthangtrantb@gmail.com',
            pass: 'Ngocthang2411'
        }
    });

    let mailOptions = {
        from: 'Hệ thống Fira',
        to: data,
        subject: text.subject,
        text: text.conten
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error.message);
        }
        console.log('Gửi thành công');
    });
}

module.exports = sendAllMail;