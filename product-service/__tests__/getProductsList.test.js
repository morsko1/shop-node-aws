import {getProductsList} from '../handler';
import mockData from '../mockData.json';

const successResponse = {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    data: mockData
  })
};

const failureResponse = {
  statusCode: 500,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({message: 'Internal server error'})
};

describe('getProductsList', () => {

  test('getProductsList: success', () => {
    return getProductsList().then(data => {
      expect(data).toEqual(successResponse);
    });
  });

  test('getProductsList: failure', () => {
    return getProductsList().catch(data => {
      expect(data).toEqual(failureResponse);
    });
  });

});
