const Mailgun = require('mailgun-js');
const AWS = require('aws-sdk');

AWS.config.update({
    "accessKeyId": process.env.KEY_ID,
    "secretAccessKey": process.env.secretAccessKey,
    "region": process.env.REGION
});

const api_key = process.env.API_KEY_MAIL_GUN;
const domain = process.env.DOMAIN_MAIL_GUN;
const from_who = process.env.EMAIL_FROM;

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05'
});

const queueURL = process.env.URL_SQS;

AWS.config.correctClockSkew = true;
const params = {
    AttributeNames: [
        "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
        "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 0
};

function sendEmail(email, message, deleteParams) {
    const mailgun = new Mailgun({
        apiKey: api_key,
        domain: domain
    });
    const data = {
        from: from_who,
        to: email,
        subject: 'Hello from Mailgun',
        html: message
    }
    mailgun.messages().send(data, function (err, body) {
        if (err) {
            console.log("got an error: ", err);
        } else {
            sqs.deleteMessage(deleteParams, function (err, data) {
                if (err) {
                    console.log("Delete Error", err);
                } else {
                    console.log("Message Deleted", data);
                }
            });
            console.log('email success sent :');

        }
    });
}


exports.sendMailGun = (event, context, callback) => {
    console.log('context :', context);
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'SQS event processed.',
            input: event,
        }),
    };

    console.log('event: ', JSON.stringify(event));
    sqs.receiveMessage(params, function (err, data) {
        if (err) {
            console.log("Receive Error", err);
        } else {
            console.log("!! data", data);
            if (data.Messages) {

                const deleteParams = {
                    QueueUrl: queueURL,
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                sendEmail(process.env.EMAIL_TO, data.Messages[0].Body, deleteParams);

            } else {
                console.log('sqs stack is empty! :');
            }
        }
    });

    callback(null, response);
};