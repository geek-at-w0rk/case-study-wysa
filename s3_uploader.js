const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({
  accessKeyId: 'your_access_key',
  secretAccessKey: 'your_secret_key',
  region: 'your_s3_region',
});

const s3 = new AWS.S3();

const bucketName = 'your_bucket_name'; // Replace with your S3 bucket name
const dataFilePath = 'transformed_data.json'; // Replace with your transformed data file path

const data = fs.readFileSync(dataFilePath);

const params = {
  Bucket: bucketName,
  Key: 'transformed_data.json', // name for your file on S3
  Body: data,
};

s3.upload(params, (err, data) => {
  if (err) {
    console.error('Error uploading data to S3:', err);
  } else {
    console.log('Data uploaded successfully to S3:', data.Location);
  }
});
