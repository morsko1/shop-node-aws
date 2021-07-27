import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import csv from 'csv-parser';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const { SQS_URL } = process.env;

const s3Client = new S3Client({ region: 'eu-west-1' });
const sqsClient = new SQSClient({ region: 'eu-west-1' });

const importFileParser = async (event) => {
  try {
    console.log('importFileParser event: ', event);
    console.log('importFileParser event.s3: ', event.Records[0].s3);

    const bucketName = event.Records[0].s3.bucket.name;
    const bucketKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log('bucketName = ', bucketName);
    console.log('bucketKey = ', bucketKey);

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: bucketKey
    });

    const { Body } = await s3Client.send(getCommand);

    const processStream = (stream) => new Promise((resolve, reject) => {
      const chunks = [];
      stream.pipe(csv()).on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(chunks));
    });

    const data = await processStream(Body);
    console.log('importFileParser data: ', data);

    // send records to SQS
    data.forEach(item => {
      const message = new SendMessageCommand({
        QueueUrl: SQS_URL,
        MessageBody: JSON.stringify(item)
      });
      sqsClient.send(message);
    });

    // copy file to parsed/ folder
    const objectName = bucketKey.slice(bucketKey.lastIndexOf('/') + 1);
    console.log('importFileParser objectName: ', objectName);
    const copyCommand = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${bucketKey}`,
      Key: `parsed/${objectName}`
    });

    const copyRes = await s3Client.send(copyCommand);
    console.log('importFileParser copyRes: ', copyRes);

    // remove file from uploaded/ folder
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: bucketKey
    });

    const deleteRes = await s3Client.send(deleteCommand);
    console.log('importFileParser deleteRes: ', deleteRes);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'importFileParser'
    };
  } catch (error) {
    console.log('importFileParser error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  }
};

export default importFileParser;
