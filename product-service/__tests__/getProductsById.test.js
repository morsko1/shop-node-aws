import {getProductsById} from '../handler';
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
    data: mockData[4]
  })
};

const notFoundResponse = {
  statusCode: 404,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    message: 'Product not found'
  })
};

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

describe('getProductsById', () => {

  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getProductsById: success', () => {
    client.query.mockResolvedValue({ rows: [mockData[4]], rowCount: 1 });
    expect(getProductsById({"pathParameters":{"productId":"4"}})).resolves.toEqual(successResponse);
  });

  test('getProductsById: not found', () => {
    client.query.mockResolvedValue({ rows: [], rowCount: 0 });
    expect(getProductsById({"pathParameters":{"productId":"44"}})).resolves.toEqual(notFoundResponse);
  });

  test('getProductsById: invalid event', () => {
    expect(getProductsById({})).resolves.toEqual(failureResponse);
  });

});
