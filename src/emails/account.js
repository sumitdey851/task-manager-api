const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sumitdey851@outlook.com',
        subject: 'Welcome onboard!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sumitdey851@outlook.com',
        subject: `Sorry to see you go!`,
        text: `Goodbye ${name}. If you could spare a moment, please let us know how we can make the app better by writing back to us. Simply click reply and write a short email to send us your suggestions.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}