import { importProductsFile } from '../handler';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return { getSignedUrl: jest.fn() };
});

const successResponse = {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify('https://mysignedurl.com/test.csv')
};

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

describe('importProductsFile', () => {

  test('importProductsFile: success', () => {
    getSignedUrl.mockResolvedValue('https://mysignedurl.com/test.csv');
    expect(importProductsFile({"queryStringParameters":{"name":"test.csv"}})).resolves.toEqual(successResponse);
  });

  test('importProductsFile: failure', () => {
    getSignedUrl.mockResolvedValue('https://mysignedurl.com/test.csv');
    expect(importProductsFile({"pathParameters":{"name":"test.csv"}})).resolves.toEqual(failureResponse);
  });

});
