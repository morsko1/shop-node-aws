import {createProduct} from '../handler';
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
  statusCode: 201,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: `Product with id "ac88584b-a7d9-4bee-b7cf-295341f8931a" has been successfully created`})
};

const validationErrorResponse = {
  statusCode: 400,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Validation Error'})
};

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

describe('createProduct', () => {

  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createProduct: success', () => {
    client.query.mockResolvedValue({ rows: [{id: 'ac88584b-a7d9-4bee-b7cf-295341f8931a'}]});
    expect(createProduct({"body": "{\"price\":5,\"description\":\"desc\",\"title\":\"titile\",\"count\":2}"})).resolves.toEqual(successResponse);
  });

  test('createProduct: validation error', () => {
    client.query.mockResolvedValue({ rows: [{id: 'ac88584b-a7d9-4bee-b7cf-295341f8931a'}]});
    expect(createProduct({"body": "{\"price\":5,\"description\":5,\"title\":\"title\",\"count\":2}"})).resolves.toEqual(validationErrorResponse);
  });

  test('createProduct: failure', () => {
    client.query.mockResolvedValue({});
    expect(createProduct({"body": "{\"price\":5,\"description\":\"desc\",\"title\":\"title\",\"count\":2}"})).resolves.toEqual(failureResponse);
  });

});
