const dotenv = require('dotenv');
const aws = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');

const randomBytes = promisify(crypto.randomBytes);

dotenv.config();

const region = process.env.REGION; // Ensure REGION is defined in your environment variables
const bucketName = process.env.BUCKET_NAME; // Ensure BUCKET_NAME is defined in your environment variables
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_ID;
console.log(region,bucketName,accessKeyId,secretAccessKey)
const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
});

async function generateUploadURL() {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString('hex');

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60, // URL expiration time in seconds
  };

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);
  return uploadURL;
}

module.exports = { generateUploadURL };
