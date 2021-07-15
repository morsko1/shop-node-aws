const catalogBatchProcess = async (event) => {
  try {
    console.log('catalogBatchProcess event: ', event);
    console.log('catalogBatchProcess event.Records: ', event.Records);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: 'catalogBatchProcess'
    };
  } catch (error) {
    console.log('catalogBatchProcess error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({message: 'Internal server error'})
    };
  }
};

export default catalogBatchProcess;
