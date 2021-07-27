import { catalogBatchProcess } from '../handler';
import { mockClient } from 'aws-sdk-client-mock';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, DeleteMessageCommand, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Client } from 'pg';

jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

const snsMock = mockClient(SNSClient);
const sqsMock = mockClient(SQSClient);

beforeEach(() => {
  snsMock.reset();
  sqsMock.reset();
});

const successResponse = {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: 'catalogBatchProcess done'
};

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

describe('catalogBatchProcess', () => {

  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('catalogBatchProcess: success', async () => {
    client.query.mockResolvedValue({ rows: [{id: 'ac88584b-a7d9-4bee-b7cf-295341f8931a'}]});

    snsMock.on(PublishCommand).resolves({
      type: 'PUBLISH',
      success: true
    });

    sqsMock.on(DeleteMessageCommand).resolves({
      type: 'DELETE',
      success: true
    });

    sqsMock.on(SendMessageCommand).resolves({
      type: 'SEND',
      success: true
    });

    const res = await catalogBatchProcess({"Records":[{"body": "{\"title\":\"Atletico Madrid Away Kit 98\",\"description\":\"Atletico de Madrid Nike 2021/22 Away Stadium Jersey - Blue/Red\",\"price\":\"119\",\"count\":\"10\"}"}, {"body": "{\"title\":\"Atletico Madrid Away Kit 99\",\"description\":\"Atletico de Madrid Nike 2021/22 Away Stadium Jersey - Blue/Red\",\"price\":\"119\",\"count\":\"15\"}"}]});
    expect(res).toEqual(successResponse);
  });

  test('catalogBatchProcess: failure', async () => {
    const res = await catalogBatchProcess({});
    expect(res).toEqual(failureResponse);
  });

});
