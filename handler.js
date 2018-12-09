'use strict';

module.exports.start = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Start page!'
    }),
  };

  callback(null, response);
};
