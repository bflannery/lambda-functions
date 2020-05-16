'use strict';

/**
 *
 * Required Env Vars:
 * UPLOAD_BUCKET_NAME
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3({signatureVersion: 'v4'});

// Epiration Time of the presignedUrl
const expirationInSeconds = 120;

const handler = (event, context, callback) => {
  
  // Get the bucket name to upload to
  const bucket = process.env.UPLOAD_BUCKET_NAME;

  if(!bucket) {
    callback('No upload bucket set, please add an output bucket in the environment variables');
    return;
  }
  if(!event.queryStringParameters.filename) {
    callback('No file uploaded');
    return;
  }

  // Reading the file name from the request. (For this you can do according to your requirment)
  const key = encodeURIComponent(event.queryStringParameters.fileName);
    
  // Params object for creating the 
  const params = {
      Bucket: bucket,
      Key: key,
      ContentType: "multipart/form-data",
      Expires: expirationInSeconds
  };

  try {
      // Creating the presigned Url
      const preSignedURL = await s3.getSignedUrl("putObject", params);

      let returnObject = {
          statusCode: 200,
          headers: {
              "access-control-allow-origin": "*"
          },
          body: JSON.stringify({
              fileUploadURL: preSignedURL
          })
      };
      return returnObject;
  } catch (e) {
      const response = {
          err: e.message,
          headers: {
              "access-control-allow-origin": "*"
          },
          body: "error occured"
      };
      return response;
  }
};


module.exports = {
  handler
};