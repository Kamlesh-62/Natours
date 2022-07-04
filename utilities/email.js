const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    // create transporter
    const transporter = nodemailer.createTransport({
        // service: 'Gmail', //this is how we can use gmail service as transporter
        // auth:{
        //     user: process.env.EMAIL_USERNAME,
        //     password: process.env.EMAIL_PASSWORD
        // }

        // Activate in gmail " less secure app" options
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_port,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }

    })
    //define email options
    const mailOptions = {
        from:'Kamlesh Prajapati <kamlesh.prajapati62@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }
    //actually send email with nodemailer
    await transporter.sendMail(mailOptions);
}
module.exports = sendEmail;