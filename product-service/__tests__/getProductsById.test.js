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

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

describe('getProductsById', () => {

  test('getProductsById: success', () => {
    return getProductsById({"pathParameters":{"productId":"4"}}).then(data => {
      expect(data).toEqual(successResponse);
    });
  });

  test('getProductsById: failure', () => {
    return getProductsById({"pathParameters":{"productId":"4"}}).catch(data => {
      expect(data).toEqual(failureResponse);
    });
  });

  test('getProductsById: wrong data in event', () => {
    return getProductsById({"pathParameters":{"productId":"blabla"}}).catch(data => {
      expect(data).toEqual(failureResponse);
    });
  });

  test('getProductsById: invalid event', () => {
    return getProductsById({}).catch(data => {
      expect(data).toEqual(failureResponse);
    });
  });

});
