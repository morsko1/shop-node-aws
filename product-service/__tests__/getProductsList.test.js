import {getProductsList} from '../handler';
import mockData from '../mockData.json';
import { Client } from 'pg';

jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

const successResponse = {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    data: mockData
  })
};

describe('getProductsList', () => {

  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getProductsList: success', async () => {
    client.query.mockResolvedValue({ rows: mockData, rowCount: 8 });
    expect(getProductsList()).resolves.toEqual(successResponse);
    const res = await getProductsList();
    const body = JSON.parse(res.body);
    expect(body.data.length).toBe(8);
  });

});
