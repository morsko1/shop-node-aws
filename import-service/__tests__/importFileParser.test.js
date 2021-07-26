import { importFileParser } from '../handler';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Readable } from 'stream';

const s3Mock = mockClient(S3Client);
const sqsMock = mockClient(SQSClient);

beforeEach(() => {
  s3Mock.reset();
  sqsMock.reset();
});

const successResponse = {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: 'importFileParser'
};

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

describe('importFileParser', () => {

  test('importFileParser: success', async () => {
    async function * gen() {
      yield 'first';
      yield 'second';
    }

    const mockEventStream = new Readable.from(gen());
    mockEventStream.pipe = () => mockEventStream;

    s3Mock.on(GetObjectCommand).resolves({
      Body: mockEventStream
    });

    s3Mock.on(CopyObjectCommand).resolves({
      success: true
    });

    s3Mock.on(DeleteObjectCommand).resolves({
      success: true
    });

    sqsMock.on(SendMessageCommand).resolves({
      success: true
    });

    const res = await importFileParser({Records: [{s3: {bucket: {name: 'shop-import-service-bucket'}, object: {key: 'uploaded/test.csv'}}}]});
    expect(res).toEqual(successResponse);
  });

  test('importFileParser: failure', async () => {
    const res = await importFileParser({Records: [{s3: {bucket: {name: 'shop-import-service-bucket'} }}]});
    expect(res).toEqual(failureResponse);
  });

});
