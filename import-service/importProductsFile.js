import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'eu-west-1' });

const importProductsFile = async (event) => {
  try {
    console.log('importProductsFile event: ', event);
    const { name } = event.queryStringParameters;

    const bucketParams = {
      Bucket: 'shop-import-service-bucket',
      Key: `uploaded/${name}`
    };

    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {expiresIn: 3600});

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(signedUrl)
    };
  } catch (error) {
    console.log('importProductsFile error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  }
};

export default importProductsFile;
