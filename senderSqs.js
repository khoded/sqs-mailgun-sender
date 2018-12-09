'use strict';

const AWS = require('aws-sdk');

AWS.config.update(
{ 
    "accessKeyId": process.env.KEY_ID, 
    "secretAccessKey": process.env.secretAccessKey, 
    "region": process.env.REGION
});
AWS.config.correctClockSkew = true;

const sqs = new AWS.SQS({
    apiVersion: '2012-11-05'
});

const urlSQS = process.env.URL_QUEUE;
let responseCode;

exports.pushToSqs = function (event, context, callback) {
    const responseBody = {
        message: ''
    };

    const params = {
        DelaySeconds: 10,
        MessageAttributes: {
            "Title": {
                DataType: "String",
                StringValue: "Test message"
            }
        },
        MessageBody: "Message from " + urlSQS,
        QueueUrl: urlSQS
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log('error:', "failed to send message" + err);
            responseCode = 500;
            callback(err);
        } else {
            responseCode = 200;
            responseBody.message = params.MessageBody;
            responseBody.messageId = data.MessageId;
            const response = {
                statusCode: responseCode,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(responseBody)
            };

            callback(null, response);
        }
    });
}
