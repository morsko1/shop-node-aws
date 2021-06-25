const importFileParser = async (event) => {
  try {
    console.log('importFileParser event: ', event);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'importFileParser'
    };
  } catch (error) {
    console.log('importFileParser error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  }
};

export default importFileParser;
