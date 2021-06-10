import {getProductsById} from '../handler';
import mockData from '../mockData.json';

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

  test('getProductsById: success', () => {
    expect(getProductsById({"pathParameters":{"productId":"4"}})).resolves.toEqual(successResponse);
  });

  test('getProductsById: not found', () => {
    expect(getProductsById({"pathParameters":{"productId":"44"}})).resolves.toEqual(notFoundResponse);
  });

  test('getProductsById: invalid event', () => {
    expect(getProductsById({})).resolves.toEqual(failureResponse);
  });

});
