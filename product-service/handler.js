'use strict';
const mockData = require('./mockData.json');

module.exports.getProductsList = async (event) => {
  try {
    const res = {
      data: mockData
    };
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(res)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  }
};

module.exports.getProductsById = async (event) => {
  try {
    const { productId = '' } = event.pathParameters;
    const product = mockData.find(product => product.id === productId);

    const res = product ? {data: product} : {message: 'Product not found'};

    return {
      statusCode: product ? 200 : 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(res)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  }
};
