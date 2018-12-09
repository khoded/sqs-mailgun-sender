'use strict';

const Mailgun = require('mailgun-js');

const api_key = process.env.API_KEY_MAIL_GUN;
const domain = process.env.DOMAIN_MAIL_GUN;
const from_who = process.env.EMAIL_FROM;

exports.sendMailGun = (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'SQS event processed.',
            input: event,
        }),
    };
    const messageToEmail = event.Records[0].body;
    sendEmail(process.env.EMAIL_TO, messageToEmail);
    callback(null, response);
};

function sendEmail(email, message) {
    const mailgun = new Mailgun({
        apiKey: api_key,
        domain: domain
    });
    const data = {
        from: from_who,
        to: email,
        subject: `Hello from ${from_who}`,
        html: message
    }
    mailgun.messages().send(data, function (err, body) {
        if (err) {
            console.log("got an error: ", err);
        } else {
            console.log('email success sent :', body);
        }
    });
}
