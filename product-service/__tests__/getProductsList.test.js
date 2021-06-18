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

describe('getProductsList', () => {

  test('getProductsList: success', async () => {
    expect(getProductsList()).resolves.toEqual(successResponse);
    const res = await getProductsList();
    const body = JSON.parse(res.body);
    expect(body.data.length).toBe(8);
  });

});
