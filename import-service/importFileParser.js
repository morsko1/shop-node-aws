import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import csv from 'csv-parser';

const s3Client = new S3Client({ region: 'eu-west-1' });

const importFileParser = async (event) => {
  try {
    console.log('importFileParser event: ', event);
    console.log('importFileParser event.s3: ', event.Records[0].s3);

    const bucketName = event.Records[0].s3.bucket.name;
    const bucketKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log('bucketName = ', bucketName);
    console.log('bucketKey = ', bucketKey);

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: bucketKey
    });

    const { Body } = await s3Client.send(command);

    const processStream = (stream) => new Promise((resolve, reject) => {
      const chunks = [];
      stream.pipe(csv()).on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(chunks));
    });

    const data = await processStream(Body);
    console.log('importFileParser data: ', data);

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
