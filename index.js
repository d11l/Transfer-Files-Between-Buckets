const AWS = require('aws-sdk');

const sourceRegionEndpoint = new AWS.Endpoint('region.digitaloceanspaces.com');
const sourceS3 = new AWS.S3({
  endpoint: sourceRegionEndpoint,
  accessKeyId: '',
  secretAccessKey: ''
});
const sourceBucket = 'sourceBucket';


const targetRegionEndpoint = new AWS.Endpoint('region.digitaloceanspaces.com');
const targetS3 = new AWS.S3({
  endpoint: targetRegionEndpoint,
  accessKeyId: '',
  secretAccessKey: ''
});
const targetBucket = 'targetBucket'; 


async function transferFilesBetweenBuckets() {
  try {
    console.log('Fetching files from the source bucket...');
    const objects = await sourceS3.listObjectsV2({ Bucket: sourceBucket }).promise();

    if (!objects.Contents || objects.Contents.length === 0) {
      console.log('No files found in the source bucket.');
      return;
    }

    for (const object of objects.Contents) {
      const fileKey = object.Key;
      console.log(`Transferring file: ${fileKey}`);

      // Get the file content from the source bucket
      const fileContent = await sourceS3
        .getObject({ Bucket: sourceBucket, Key: fileKey })
        .promise();

      
      await targetS3
        .putObject({
          Bucket: targetBucket,
          Key: fileKey,
          Body: fileContent.Body,
          ContentType: fileContent.ContentType,
          ACL: "public-read"// Set the ACL as needed ["private", "public-read", "public-read-write", "authenticated-read", "aws-exec-read", "bucket-owner-read", "bucket-owner-full-control"]
        })
        .promise();

      console.log(`Successfully transferred: ${fileKey}`);
    }

    console.log('File transfer completed.');
  } catch (error) {
    console.error('Error during file transfer:', error);
  }
}


transferFilesBetweenBuckets();